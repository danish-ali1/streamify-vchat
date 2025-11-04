import { generateStreamToken } from "../lib/stream.js";

export const getStreamToken = async (req, res) => {
    try {
        // Ensure this response is never cached by the browser or intermediaries
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const token = generateStreamToken(req.user.id);

        if (!token) {
            console.error("Stream token generation returned empty for user:", req.user?.id);
            return res.status(500).json({ error: "Failed to generate token" });
        }

            // Log token generation for debugging (token preview only)
            try {
                console.log(`Generated Stream token for user ${req.user?.id} tokenPreview=${token.slice(0,8)}`);
            } catch (e) {
                // ignore logging errors
            }

            return res.status(200).json({ token });
    } catch (error) {
        console.error("Error generating Stream token:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};