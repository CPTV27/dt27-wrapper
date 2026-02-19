"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const express = __importStar(require("express"));
const cors = __importStar(require("cors"));
const google_auth_library_1 = require("google-auth-library");
const node_fetch_1 = __importDefault(require("node-fetch"));
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
// --- Configuration ---
// In production, these should be set via:
// firebase functions:config:set google.client_id="..." google.client_secret="..." ...
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ((_a = functions.config().google) === null || _a === void 0 ? void 0 : _a.client_id);
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ((_b = functions.config().google) === null || _b === void 0 ? void 0 : _b.client_secret);
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || ((_c = functions.config().google) === null || _c === void 0 ? void 0 : _c.refresh_token);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ((_d = functions.config().gemini) === null || _d === void 0 ? void 0 : _d.api_key);
const APP_URL = process.env.APP_URL || ((_e = functions.config().app) === null || _e === void 0 ? void 0 : _e.url) || 'https://sidekick-bigmuddy.web.app';
// --- Google OAuth Helpers ---
async function getAccessToken() {
    const params = new URLSearchParams();
    params.append('client_id', GOOGLE_CLIENT_ID || '');
    params.append('client_secret', GOOGLE_CLIENT_SECRET || '');
    params.append('refresh_token', GOOGLE_REFRESH_TOKEN || '');
    params.append('grant_type', 'refresh_token');
    const res = await (0, node_fetch_1.default)('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to get access token:', errorText);
        throw new Error(`Failed to get access token: ${res.statusText}`);
    }
    const data = await res.json();
    return data.access_token;
}
// --- API Routes ---
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// OAuth URL Generator
app.get("/auth/url", (req, res) => {
    const oauth2Client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `${APP_URL}/api/auth/callback`);
    const scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/tasks"
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
    });
    res.json({ url });
});
// OAuth Callback
app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    if (typeof code !== 'string') {
        return res.status(400).send('Invalid code');
    }
    try {
        const oauth2Client = new google_auth_library_1.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, `${APP_URL}/api/auth/callback`);
        const { tokens } = await oauth2Client.getToken(code);
        res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'OAUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
            window.close();
          </script>
          <p>Authentication successful. You can close this window.</p>
        </body>
      </html>
    `);
    }
    catch (error) {
        console.error('Error retrieving access token', error);
        res.status(500).send('Authentication failed');
    }
});
// Sheets Proxy
app.get("/sheets/:spreadsheetId/:tab", async (req, res) => {
    try {
        const { spreadsheetId, tab } = req.params;
        const token = await getAccessToken();
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(tab)}`;
        const apiRes = await (0, node_fetch_1.default)(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!apiRes.ok)
            throw new Error(`Sheets API error: ${apiRes.statusText}`);
        const data = await apiRes.json();
        res.json(data.values || []);
    }
    catch (error) {
        console.error("Sheets Proxy Error:", error);
        res.status(500).json({ error: "Failed to fetch sheet data" });
    }
});
// Drive Proxy
app.get("/drive/:folderId", async (req, res) => {
    try {
        const { folderId } = req.params;
        const token = await getAccessToken();
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType,thumbnailLink)`;
        const apiRes = await (0, node_fetch_1.default)(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!apiRes.ok)
            throw new Error(`Drive API error: ${apiRes.statusText}`);
        const data = await apiRes.json();
        res.json(data.files || []);
    }
    catch (error) {
        console.error("Drive Proxy Error:", error);
        res.status(500).json({ error: "Failed to fetch drive files" });
    }
});
// Image Gen Proxy
app.post("/ai/image", async (req, res) => {
    var _a, _b, _c;
    try {
        const { prompt } = req.body;
        const apiRes = await (0, node_fetch_1.default)(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseModalities: ['image', 'text'] }
            })
        });
        if (!apiRes.ok) {
            const err = await apiRes.text();
            console.error("Gemini Image API Error:", err);
            throw new Error(`Gemini API error: ${err}`);
        }
        const data = await apiRes.json();
        const parts = ((_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) || [];
        const imagePart = parts.find((p) => p.inlineData);
        if (imagePart) {
            res.json({ image: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType });
        }
        else {
            res.status(500).json({ error: "No image generated" });
        }
    }
    catch (error) {
        console.error("Image Gen Proxy Error:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});
// Veo Video Proxy (Placeholder structure for future implementation)
app.post("/ai/video", async (req, res) => {
    // Similar structure to image gen, but calling the video endpoint
    res.status(501).json({ error: "Video generation endpoint not fully implemented in Cloud Function yet" });
});
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map