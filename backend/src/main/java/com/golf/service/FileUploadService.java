package com.golf.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
public class FileUploadService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    /**
     * Upload a file to Cloudinary and return the secure URL.
     * Falls back to a placeholder URL if Cloudinary is not configured.
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (cloudName.isBlank() || apiKey.isBlank()) {
            log.warn("Cloudinary not configured — returning placeholder URL");
            return "https://via.placeholder.com/400x300?text=Proof+Uploaded";
        }

        try {
            byte[] fileBytes = file.getBytes();
            String base64File = Base64.getEncoder().encodeToString(fileBytes);
            String dataUri = "data:" + file.getContentType() + ";base64," + base64File;

            String timestamp = String.valueOf(System.currentTimeMillis() / 1000);
            String publicId = folder + "/" + UUID.randomUUID();

            // Build signature
            String toSign = "folder=" + folder + "&public_id=" + publicId + "&timestamp=" + timestamp + apiSecret;
            String signature = sha1Hex(toSign);

            // Build multipart form body
            String boundary = "----FormBoundary" + UUID.randomUUID().toString().replace("-", "");
            String body = "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"file\"\r\n\r\n" + dataUri + "\r\n" +
                    "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"api_key\"\r\n\r\n" + apiKey + "\r\n" +
                    "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"timestamp\"\r\n\r\n" + timestamp + "\r\n" +
                    "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"signature\"\r\n\r\n" + signature + "\r\n" +
                    "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"public_id\"\r\n\r\n" + publicId + "\r\n" +
                    "--" + boundary + "\r\n" +
                    "Content-Disposition: form-data; name=\"folder\"\r\n\r\n" + folder + "\r\n" +
                    "--" + boundary + "--\r\n";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload"))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body();

            // Extract secure_url from JSON response
            int urlStart = responseBody.indexOf("\"secure_url\":\"") + 14;
            int urlEnd = responseBody.indexOf("\"", urlStart);
            if (urlStart > 14 && urlEnd > urlStart) {
                return responseBody.substring(urlStart, urlEnd);
            }

            throw new IOException("Failed to parse Cloudinary response: " + responseBody);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Upload interrupted", e);
        }
    }

    private String sha1Hex(String input) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-1");
            byte[] hash = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-1 error", e);
        }
    }
}
