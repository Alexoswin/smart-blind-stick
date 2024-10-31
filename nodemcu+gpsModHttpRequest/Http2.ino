#include <TinyGPS++.h>        // GPS library
#include <SoftwareSerial.h>   // For communication with GPS module
#include <ESP8266WiFi.h>      // Wi-Fi library
#include <WiFiClientSecure.h> // HTTPS client

// GPS setup
TinyGPSPlus gps;
SoftwareSerial ss(4, 5); // D2 = RX, D1 = TX

// Wi-Fi credentials
const char* ssid = "Glen";          // Replace with your Wi-Fi SSID
const char* password = "glen1708";  // Replace with your Wi-Fi password

// Server details
const char* server = "smart-blind-stick-4.onrender.com";
const int port = 443; // HTTPS port

// HTTPS client
WiFiClientSecure client;

void setup() {
  Serial.begin(115200); // Serial monitor
  ss.begin(9600);       // GPS communication

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi!");

  // Set the client to skip certificate validation (use for testing only)
  client.setInsecure();

  Serial.println("Getting GPS coordinates...");
}

void loop() {
  while (ss.available() > 0) {
    gps.encode(ss.read());  // Parse the GPS data

    if (gps.location.isValid()) {
      float latitude = gps.location.lat();
      float longitude = gps.location.lng();

      Serial.print("Latitude: ");
      Serial.println(latitude, 6);
      Serial.print("Longitude: ");
      Serial.println(longitude, 6);

      // Create JSON payload
      String postData = "{ \"id\": \"0\", \"lat\": " + String(latitude, 6) + ", \"long\": " + String(longitude, 6) + " }";
      sendPostRequest(postData);
    } else {
      Serial.println("Waiting for GPS signal...");
    }
  }
  delay(5000);  // Wait 5 seconds before sending the next request
}

void sendPostRequest(String postData) {
  Serial.println("Connecting to server...");

  // Connect to the server
  if (client.connect(server, port)) {
    Serial.println("Connected to server!");

    // Send the HTTP POST request
    client.println("POST /location HTTP/1.1");
    client.println("Host: " + String(server));
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.print("Content-Length: ");
    client.println(postData.length());
    client.println();
    client.println(postData);

    // Wait for server response
    while (client.connected()) {
      String line = client.readStringUntil('\n');
      if (line == "\r") {
        Serial.println("Headers received.");
        break;
      }
    }

    // Print the response body
    String response = client.readString();
    Serial.println("Response: " + response);
  } else {
    Serial.println("Connection failed.");
  }

  client.stop();  // Close the connection
}
