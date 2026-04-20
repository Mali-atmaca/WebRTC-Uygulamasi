// Arayüz Elementlerini Seçme
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startBtn = document.getElementById('startBtn');
const callBtn = document.getElementById('callBtn');
const endBtn = document.getElementById('endBtn');

const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');


let localStream;
let peerConnection;
let dataChannel;


const ws = new WebSocket('ws://localhost:5000'); 
const configuration = {
    'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]
};


startBtn.onclick = async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        
        callBtn.disabled = false; 
        startBtn.disabled = true; 
        console.log("Kamera başarıyla açıldı.");
    } catch (error) {
        console.error("Kamera hatası:", error);
        alert("Kameraya erişilemedi! İzinleri kontrol edin.");
    }
};


function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    // Kendi kameramızı tünele ekle (Eğer kamera açıksa)
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }

    
    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    };

    dataChannel = peerConnection.createDataChannel("chatKanalim");
    dataChannel.onopen = () => {
        chatInput.disabled = false;
        sendBtn.disabled = false;
    };
    dataChannel.onmessage = (event) => {
        chatBox.innerHTML += `<p style="color:#2e7d32; margin:5px 0;"><b>Karşı Taraf:</b> ${event.data}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    peerConnection.ondatachannel = (event) => {
        const receiveChannel = event.channel;
        receiveChannel.onopen = () => {
            chatInput.disabled = false;
            sendBtn.disabled = false;
        };
        receiveChannel.onmessage = (e) => {
            chatBox.innerHTML += `<p style="color:#2e7d32; margin:5px 0;"><b>Karşı Taraf:</b> ${e.data}</p>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        };
        dataChannel = receiveChannel;
    };
}

// 3. ARAMA YAPMA
callBtn.onclick = async () => {
    createPeerConnection();
    
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', offer: offer }));
    
    callBtn.disabled = true;
    endBtn.disabled = false; 
};


ws.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'offer') {
        // HATA ÖNLEME: Gelen arama var ama kameramız açık değilse uyar!
        if (!localStream) {
            alert("Biri sizi arıyor ama kameranız kapalı! Lütfen 'Kamerayı Aç' butonuna basıp ardından sayfayı yenileyin.");
            return; 
        }

        if (!peerConnection) createPeerConnection();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        ws.send(JSON.stringify({ type: 'answer', answer: answer }));
        
        callBtn.disabled = true;
        endBtn.disabled = false; 

    } else if (message.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));

    } else if (message.type === 'candidate') {
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    } else if (message.type === 'bye') {
        endCall(); // Karşı taraf telefonu kapatırsa biz de sistemi sıfırlarız
    }
};

sendBtn.onclick = () => {
    const message = chatInput.value;
    if(message.trim() === "") return;

    dataChannel.send(message); 
    chatBox.innerHTML += `<p style="color:#1976d2; margin:5px 0;"><b>Sen:</b> ${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    chatInput.value = ''; 
};


function endCall() {
    // 1. WebRTC bağlantılarını kapat
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (dataChannel) {
        dataChannel.close();
        dataChannel = null;
    }
    

    remoteVideo.srcObject = null;
    
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop()); 
        localVideo.srcObject = null;
        localStream = null;
    }
    
    
    startBtn.disabled = false;  
    callBtn.disabled = true;    
    endBtn.disabled = true;
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    chatBox.innerHTML += `<p style="color:#d32f2f; text-align:center; font-style:italic; margin:5px 0;">Arama sonlandırıldı.</p>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

endBtn.onclick = () => {
    endCall(); // Kendi tarafımızı kapat
    ws.send(JSON.stringify({ type: 'bye' })); 
};