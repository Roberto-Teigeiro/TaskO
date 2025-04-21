package com.springboot.TaskO.service;

import com.springboot.TaskO.model.UserItem;
import com.springboot.TaskO.repository.UserItemRepository;

import org.apache.tomcat.jni.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.util.List;
import java.util.Optional;
import java.security.spec.X509EncodedKeySpec;
import java.security.spec.RSAPublicKeySpec;
import java.math.BigInteger;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

// Add these imports:
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class UserItemService {

    @Autowired
    private UserItemRepository userItemRepository;
    public List<UserItem> findAll(){
        List<UserItem> todoItems = userItemRepository.findAll();
        return todoItems;
    }
    public UserItem addUserItem(UserItem userItem){
        return userItemRepository.save(userItem);
    }

    public UserItem addTelegramToUserItem(String id, String telegramUsername){
        Optional<UserItem> existingUserItem = userItemRepository.findById(id);
        if(existingUserItem.isPresent()){
            UserItem updatedUserItem = existingUserItem.get();
            updatedUserItem.setTelegramUsername(telegramUsername);
            return userItemRepository.save(updatedUserItem);
        }else{
            return null;
        }
    }

    public boolean deleteTaskItem(String id){
        try{
            userItemRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }
  

    public UserItem verifyJwtWithClerk(String jwt) {
        try {
            // Validate JWT format
            if (jwt == null || !jwt.contains(".") || jwt.split("\\.").length != 3) {
                System.err.println("Malformed JWT: " + jwt);
                return null;
            }
            
            // Fix common issues with JWT from HTTP headers
            if (jwt.startsWith("Bearer ")) {
                jwt = jwt.substring(7);
            }
            
            jwt = jwt.trim(); // Remove any extra whitespace
            
            // Extract kid from JWT header with better error handling
            String[] jwtParts = jwt.split("\\.");
            String headerPart = jwtParts[0];
            
            // Make sure the base64 string has proper padding
            while (headerPart.length() % 4 != 0) {
                headerPart += "=";
            }
            
            try {
                // Attempt to decode the header
                byte[] decodedHeaderBytes = Base64.getUrlDecoder().decode(headerPart);
                String headerJson = new String(decodedHeaderBytes);
                
                System.out.println("Successfully decoded header: " + headerJson);
                
                ObjectMapper mapper = new ObjectMapper();
                JsonNode header = mapper.readTree(headerJson);
                String kid = header.get("kid").asText();
                
                // Get the right public key based on kid
                RSAPublicKey publicKey = getClerkPublicKey(kid);
                if (publicKey == null) {
                    System.err.println("Could not retrieve public key for kid: " + kid);
                    return null;
                }
                
                // Create the verifier
                Algorithm algorithm = Algorithm.RSA256(publicKey, null);
                JWTVerifier verifier = JWT.require(algorithm)
                        .withIssuer("https://assuring-lynx-95.clerk.accounts.dev")
                        .build();
                
                // Verify and decode
                DecodedJWT decodedJwt = verifier.verify(jwt);
                
                // Extract claims with better debugging
                String userId = null;
                String fullName = null;
                String email = null;
                
                try {
                    userId = decodedJwt.getClaim("userId").asString();
                    // Fall back to subject if userId claim is not present
                    if (userId == null || userId.isEmpty()) {
                        userId = decodedJwt.getSubject();
                        System.out.println("Using subject as userId: " + userId);
                    }
                } catch (Exception e) {
                    System.out.println("Error extracting userId: " + e.getMessage());
                }
                
                try {
                    fullName = decodedJwt.getClaim("fullName").asString();
                } catch (Exception e) {
                    System.out.println("Error extracting fullName: " + e.getMessage());
                }
                
                try {
                    email = decodedJwt.getClaim("email").asString();
                } catch (Exception e) {
                    System.out.println("Error extracting email: " + e.getMessage());
                }
                
                System.out.println("Extracted claims - userId: " + userId + ", fullName: " + fullName + ", email: " + email);
                
                // Validate required claims
                if (userId == null || email == null) {
                    System.out.println("Missing required claims - userId: " + (userId == null) + ", email: " + (email == null));
                    return null;
                }
                
                // Create and return a UserItem object
                return new UserItem(userId, fullName, email, null);
            } catch (Exception e) {
                System.err.println("Error decoding JWT header: " + e.getMessage());
                e.printStackTrace();
                return null;
            }
        } catch (Exception e) {
            System.err.println("JWT verification failed: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    // Add this method to fetch the public key dynamically:
    private RSAPublicKey getClerkPublicKey(String kid) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String jwksUrl = "https://assuring-lynx-95.clerk.accounts.dev/.well-known/jwks.json";
            String jwksJson = restTemplate.getForObject(jwksUrl, String.class);
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jwks = mapper.readTree(jwksJson);
            JsonNode keys = jwks.get("keys");
            
            for (JsonNode key : keys) {
                if (kid.equals(key.get("kid").asText())) {
                    String n = key.get("n").asText();
                    String e = key.get("e").asText();
                    
                    // Convert to RSAPublicKey
                    BigInteger modulus = new BigInteger(1, Base64.getUrlDecoder().decode(n));
                    BigInteger exponent = new BigInteger(1, Base64.getUrlDecoder().decode(e));
                    
                    RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
                    KeyFactory factory = KeyFactory.getInstance("RSA");
                    return (RSAPublicKey) factory.generatePublic(spec);
                }
            }
            throw new Exception("Public key not found for kid: " + kid);
        } catch (Exception e) {
            System.err.println("Failed to get public key: " + e.getMessage());
            return null;
        }
    }
}
