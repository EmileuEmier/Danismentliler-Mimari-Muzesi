/* =========================================================
   Dânişmendliler Mimari Müzesi - panorama.js
   Pannellum.js 360° Sanal Tur / Panorama entegrasyonu

   Yeni mimaride 360° görünüm yalnızca eser DETAY ekranı
   açıldığında ve o esere ait görsel ile yüklenir.
   ========================================================= */

// Detay ekranındaki tek aktif panorama görüntüleyicisini tutar
let detailPanoramaViewer = null;

/* -------------------------------------------------------
   DETAY PANORAMASINI YÜKLE
   imageSrc boş ya da görsel bulunamazsa yedek yazı gösterilir.
------------------------------------------------------- */
function loadDetailPanorama(imageSrc) {
    const container = document.getElementById('detailPano');
    if (!container) return;

    // Pannellum kütüphanesi henüz hazır değilse tekrar denenmek üzere çık
    if (typeof pannellum === 'undefined') return;

    // Önceki görüntüleyiciyi yok et ve konteyneri temizle
    destroyDetailPanorama();

    container.innerHTML = '<div class="pano-placeholder">Yükleniyor...</div>';
    container.dataset.panorama = imageSrc || '';

    if (!imageSrc) {
        showPanoramaFallback(container, '360° görseli henüz eklenmedi (assets/panoramas/)');
        return;
    }

    // Yükleme yazısını gizle (Pannellum kendi yükleme katmanını yönetir)
    const placeholder = container.querySelector('.pano-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    try {
        detailPanoramaViewer = pannellum.viewer('detailPano', {
            type: 'equirectangular',              // standart 360° equirectangular görsel
            panorama: imageSrc,
            autoLoad: true,                       // görseli otomatik yükle
            autoRotate: -2,                       // hafif otomatik dönüş
            compass: true,                        // pusula göstergesi
            showZoomCtrl: true,                   // yakınlaştırma kontrolü
            showFullscreenCtrl: true,             // tam ekran kontrolü
            mouseZoom: true,                      // fare ile yakınlaştırma (pan-zoom)
            hfov: 100,                            // başlangıç görüş açısı
            friction: 0.15,                       // sürükleme sürtünmesi
            strings: {
                loadButtonLabel: 'Tıklamak için yükle',
                loadingLabel: 'Yükleniyor...',
                noPanoramaError: 'Panorama görseli bulunamadı.',
                fileAccessError: 'Dosyaya erişilemedi: %s',
                malformedURLError: 'Geçersiz panorama adresi.',
                iOS8WebGLError: 'iOS 8 WebGL hatası.',
                genericWebGLError: 'WebGL hatası.',
                textureSizeError: 'Panorama görseli çok büyük.',
                unknownError: 'Bilinmeyen bir hata oluştu.'
            }
        });

        // Görsel yüklenemediğinde yedek yazı göster
        detailPanoramaViewer.on('error', function () {
            destroyDetailPanorama();
            showPanoramaFallback(container, '360° görseli henüz eklenmedi (assets/panoramas/)');
        });
    } catch (e) {
        showPanoramaFallback(container, '360° görüntüleyici başlatılamadı.');
    }
}

/* -------------------------------------------------------
   DETAY PANORAMASINI YOK ET
   Belleği serbest bırakmak ve yeni görsel yüklemek için.
------------------------------------------------------- */
function destroyDetailPanorama() {
    if (detailPanoramaViewer) {
        try {
            detailPanoramaViewer.destroy();
        } catch (e) {
            /* yok etme hatası yok sayılır */
        }
        detailPanoramaViewer = null;
    }
}

/* -------------------------------------------------------
   DETAY PANORAMASININ OTOMATİK DÖNÜŞÜNÜ DURDUR
   Detay ekranı kapatıldığında performans için çağrılır.
------------------------------------------------------- */
function stopDetailPanorama() {
    if (detailPanoramaViewer && typeof detailPanoramaViewer.stopAutoRotate === 'function') {
        detailPanoramaViewer.stopAutoRotate();
    }
}

/* -------------------------------------------------------
   YEDEK (FALLBACK) YAZISI GÖSTER
------------------------------------------------------- */
function showPanoramaFallback(container, message) {
    let note = container.querySelector('.pano-placeholder');
    if (!note) {
        note = document.createElement('div');
        note.className = 'pano-placeholder';
        container.appendChild(note);
    }
    note.textContent = message;
    note.style.display = 'flex';
}

/* -------------------------------------------------------
   PENCERE BOYUTU DEĞİŞİNCE PANORAMAYI YENİDEN BOYUTLANDIR
------------------------------------------------------- */
window.addEventListener('resize', function () {
    clearTimeout(window.__panoResizeTimer);
    window.__panoResizeTimer = setTimeout(function () {
        if (detailPanoramaViewer && typeof detailPanoramaViewer.resize === 'function') {
            detailPanoramaViewer.resize();
        }
    }, 250);
});
