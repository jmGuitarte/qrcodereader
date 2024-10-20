function startQRScanner() {
    const videoElement = document.getElementById('qr-video');
    const canvasElement = document.getElementById('qr-canvas');
    const canvasContext = canvasElement.getContext('2d');
    const qrResult = document.getElementById('qr-result');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.setAttribute("playsinline", true);
            videoElement.play();
            requestAnimationFrame(tick);
        });

    function tick() {
        if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            canvasElement.height = videoElement.videoHeight;
            canvasElement.width = videoElement.videoWidth;
            canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

            const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
            const code = jsQR(imageData.data, canvasElement.width, canvasElement.height);

            if (code) {
                qrResult.innerText = "QR Code Detected: " + code.data;
                alert("You QR code is: " + code.data);
                saveToGoogleSheet(code.data); // Call the function to save to Google Sheets
            }
        }
        requestAnimationFrame(tick);
    }
}

async function saveToGoogleSheet(qrData) {
    const endpoint = "https://script.google.com/macros/s/AKfycbycPTi20EHXRB45gqZG2m0y_8kz5nBTMbfven3sQ1E1fgR_RMSA4eKflMHP6W1lc-qG/exec"; // Replace with your Google Apps Script URL

    const data = {
        qrData: qrData,
        timestamp: new Date().toISOString() // Get current timestamp
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(data), // Send the scanned QR code and timestamp
            headers: {
                "Content-Type": "application/json", // Use application/json for JSON data
            },
        });

        if (!response.ok) {
            throw new Error('Failed to add row: ' + response.statusText);
        }

        const result = await response.json(); // Parse the JSON response
        console.log('Success:', result); // Handle the success response
    } catch (error) {
        console.error('Error:', error); // Handle errors
    }
}

document.addEventListener("DOMContentLoaded", startQRScanner);
