using System;
using System.Collections.Generic;
using Fleck;

namespace WebRTCSignalingServer
{
    class Program
    {
        static void Main(string[] args)
        {
            // Sinyalleşme sunucumuzu 5000 portunda başlatıyoruz
            var server = new WebSocketServer("ws://0.0.0.0:5000");

            // Bağlanan tarayıcıları tutacağımız liste
            var allSockets = new List<IWebSocketConnection>();

            server.Start(socket =>
            {
                // Bir tarayıcı sekmesi açılıp bağlandığında
                socket.OnOpen = () =>
                {
                    Console.WriteLine($"Yeni bağlantı geldi! ID: {socket.ConnectionInfo.Id}");
                    allSockets.Add(socket);
                };

                // Tarayıcı sekmesi kapatıldığında
                socket.OnClose = () =>
                {
                    Console.WriteLine($"Bağlantı koptu! ID: {socket.ConnectionInfo.Id}");
                    allSockets.Remove(socket);
                };

                // Tarayıcıdan bir mesaj (Offer/Answer/Candidate) geldiğinde
                socket.OnMessage = message =>
                {
                    Console.WriteLine("Sinyal alındı, karşı tarafa iletiliyor...");

                    // Mesajı gönderen HARİÇ diğer tüm sekmelere mesajı pasla
                    foreach (var client in allSockets)
                    {
                        if (client != socket)
                        {
                            client.Send(message);
                        }
                    }
                };
            });

            Console.WriteLine("Sinyalleşme Sunucusu Başladı!");
            Console.WriteLine("Tarayıcılardan bağlantı bekleniyor...");
            Console.ReadLine(); // Konsolun hemen kapanmasını engeller
        }
    }
}