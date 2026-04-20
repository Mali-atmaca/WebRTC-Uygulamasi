# WebRTC P2P Video & Signaling Server 🎥

Bu proje, **İleri Programlama** dersi kapsamında geliştirilmiş; tarayıcılar arasında gerçek zamanlı, eşten eşe (peer-to-peer) iletişim kurmayı sağlayan bir uygulamadır. Merkezi bir sunucu üzerinden sinyalleşme (handshake) yaparak cihazların doğrudan birbiriyle veri alışverişi yapmasını sağlar.

## 🚀 Öne Çıkan Özellikler
* **Sinyalleşme Sunucusu:** Cihazların IP ve bağlantı bilgilerini takas etmesini sağlayan WebSocket tabanlı yapı.
* **P2P Bağlantı:** Görüntü ve ses verisinin sunucuya uğramadan doğrudan kullanıcılar arasında iletilmesi.
* **Düşük Gecikme:** WebRTC protokolü sayesinde milisaniyeler bazında iletişim.

## 🛠️ Teknik Altyapı
* **Backend:** Node.js
* **Sinyalleşme:** WebSocket / Socket.io
* **Frontend:** Vanilla JavaScript & HTML5 MediaDevices API

## 📂 Dosya Yapısı
| Dosya / Klasör | Görev |
| :--- | :--- |
| `WebRTCSignalingServer/` | Sunucu tarafı kodlarını ve bağımlılıkları içeren klasör. |
| `app.js` | Uygulamanın istemci taraflı WebRTC mantığını yöneten ana script. |
| `index.html` | Kullanıcı arayüzü ve video ekranlarını içeren sayfa. |

## ⚙️ Kurulum ve Çalıştırma
1. Sinyalleşme sunucusunu başlatın:
   ```bash
   cd WebRTCSignalingServer
   node server.js (veya dosya adın neyse)
