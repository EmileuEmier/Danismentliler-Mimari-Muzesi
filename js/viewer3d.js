/* =========================================================
   Dânişmendliler Mimari Müzesi - viewer3d.js
   Google <model-viewer> kütüphanesi entegrasyonu ve kontrolü

   Yeni mimaride 3D modeller yalnızca eser DETAY ekranı
   açıldığında yüklenir (performans optimizasyonu).
   ========================================================= */

// Yapılandırılmış görüntüleyicileri ve yüklenme durumlarını tutar
const viewer3DState = new WeakMap();

/* -------------------------------------------------------
   TEK BİR 3D MODEL GÖRÜNTÜLEYİCİNİ YAPILANDIR
   Ortak ayarları uygular ve yükleme / hata olaylarını dinler.
   Aynı eleman için olaylar yalnızca bir kez bağlanır.
------------------------------------------------------- */
function configureModelViewer(viewer) {
    if (!viewer || viewer3DState.has(viewer)) return;

    viewer3DState.set(viewer, { loaded: false, error: false });

    // Performans: model yalnızca görünür olduğunda yüklenir
    if (!viewer.hasAttribute('reveal')) {
        viewer.setAttribute('reveal', 'auto');
    }

    // Model başarıyla yüklendiğinde yedek yazıyı güncelle
    viewer.addEventListener('load', function () {
        viewer3DState.set(viewer, { loaded: true, error: false });
        const poster = viewer.querySelector('[slot="poster"]');
        if (poster) poster.textContent = 'Yapılacak';
    });

    // Model dosyası bulunamazsa (assets/models henüz boşken) uyarı göster
    viewer.addEventListener('error', function () {
        viewer3DState.set(viewer, { loaded: false, error: true });
        const poster = viewer.querySelector('[slot="poster"]');
        if (poster) {
            poster.textContent = '3D model henüz eklenmedi (assets/models/)';
        }
    });
}

/* -------------------------------------------------------
   BELİRLİ BİR GÖRÜNTÜLEYİCİYE MODEL YÜKLE
   main.js tarafından eser detayı açılırken çağrılır.
------------------------------------------------------- */
function loadModelViewer(viewer, src) {
    if (!viewer) return;

    // Olayları yalnızca ilk kez bağla
    configureModelViewer(viewer);

    // Yedek yazıyı yükleme durumuna al
    const poster = viewer.querySelector('[slot="poster"]');
    if (poster) poster.textContent = '3D model yükleniyor...';

    // Yeni model yolunu ata (aynı yol ise yeniden yükleme yapılmaz)
    viewer.setAttribute('src', src || '');
}

/* -------------------------------------------------------
   SAYFADAKİ TÜM 3D GÖRÜNTÜLEYİCİLERİ BAŞLAT
------------------------------------------------------- */
function initAllViewers3D() {
    const viewers = document.querySelectorAll('model-viewer');
    viewers.forEach(configureModelViewer);
    return viewers.length;
}

/* -------------------------------------------------------
   BAŞLATMA
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    initAllViewers3D();
});

/* -------------------------------------------------------
   3D MODEL OTOMATİK DÖNME KONTROLÜ (AÇ / KAPAT)
------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    const toggleBtn = document.getElementById('toggleAutoRotateBtn');
    const modelViewer = document.getElementById('detailModel');

    if (toggleBtn && modelViewer) {
        toggleBtn.addEventListener('click', function () {
            // Eğer auto-rotate özelliği varsa kaldır (kapat), yoksa ekle (aç)
            if (modelViewer.hasAttribute('auto-rotate')) {
                modelViewer.removeAttribute('auto-rotate');
                toggleBtn.textContent = '🔄 Otomatik Dönme: Kapalı';
                toggleBtn.style.backgroundColor = '#f0f0f0';
                toggleBtn.style.color = '#333';
            } else {
                modelViewer.setAttribute('auto-rotate', '');
                toggleBtn.textContent = '🔄 Otomatik Dönme: Açık';
                toggleBtn.style.backgroundColor = '#28a745'; // Açıkken yeşil tonlarında belirgin olsun
                toggleBtn.style.color = '#fff';
            }
        });
    }
});