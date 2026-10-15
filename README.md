# Dânişmendliler Mimari Müzesi

10. sınıf tarih projesi olarak geliştirilen, **Tek Sayfa Uygulama (SPA)** mimarisiyle hazırlanmış modern, responsive ve yüksek performanslı dijital müze.

## Özellikler

- **SPA Geçişleri:** Sayfa yenilenmeden Ana Sayfa / Eserlerimiz / Kaynakça / Ekibimiz bölümleri arasında geçiş (`.active` sınıf yönetimi).
- **3D Görünüm:** Google `<model-viewer>` (CDN) ile döndürülebilir, yakınlaştırılabilir 3D eser modelleri (`assets/models/`).
- **360° Sanal Tur:** Pannellum.js (CDN) ile fare ile pan-zoom yapılan 360° panorama görüntüleyiciler (`assets/panoramas/`).
- **Tema:** Selçuklu / Dânişmendli esintili tarihi renk paleti ve tipografi (Cinzel + Plus Jakarta Sans).
- **Responsive:** Mobil hamburger menü ve mobil-öncelikli grid düzenleri.

## Klasör Yapısı

```
Danismentliler-Mimari-Muzesi/
├── index.html              # Ana HTML iskeleti, CDN bağlantıları ve DOM yapısı
├── README.md               # Bu dosya
├── .gitignore              # Versiyon kontrol istisnaları
├── css/
│   └── style.css           # Tema değişkenleri, stiller, responsive CSS
├── js/
│   ├── main.js             # SPA geçişleri, aktif menü, mobil menü toggle
│   ├── viewer3d.js         # <model-viewer> yapılandırması ve yardımcılar
│   └── panorama.js         # Pannellum 360° görüntüleyici başlatma
└── assets/
    ├── models/             # .glb / .gltf 3D model dosyaları
    ├── panoramas/          # 360° equirectangular görseller
    └── images/             # Genel görseller
```

## Çalıştırma

İstatik bir proje olduğu için sunucu gerekmez; `index.html` dosyasını tarayıcıda açmanız yeterlidir. (3D/panorama dosyaları `file://` protokolünde kısıtlanabilir, bu durumda yerel bir sunucu kullanılması önerilir: `npx serve .`)

## Eserler

1. Yağıbasan Medresesi — Tokat / Niksar
2. Niksar Ulu Camii — Tokat / Niksar
3. Çağlayan Köprüsü — Amasya

> Açıklama metinleri, kaynakça ve ekip bilgileri şimdilik **"Yapılacak"** olarak bırakılmıştır.

## Lisans

Dânişmendliler Mimari Müzesi © 2026 - Tüm Hakları Saklıdır.
