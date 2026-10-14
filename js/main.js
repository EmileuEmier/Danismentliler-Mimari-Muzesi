/* =========================================================
   Danışmentliler Mimari Müzesi - main.js
   SPA sayfa geçişleri, eser liste/detay yönetimi ve
   genel etkileşimler
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------------- ELEMAN REFERANSLARI ---------------- */
    const navButtons = document.querySelectorAll('[data-section]'); // Menü + hero butonları
    const sections = document.querySelectorAll('.section');        // SPA bölümleri
    const navMenu = document.getElementById('navMenu');            // Mobil menü kabı
    const hamburger = document.getElementById('hamburgerBtn');     // Hamburger butonu

    // Eser liste ve detay elemanları
    const artifactList = document.getElementById('artifactList');     // Yatay eser listesi
    const artifactDetail = document.getElementById('artifactDetail'); // Detay ekranı
    const detailBack = document.getElementById('detailBack');         // Geri dön butonu
    const detailTitle = document.getElementById('detailTitle');       // Detay başlığı
    const detailLocation = document.getElementById('detailLocation'); // Detay konumu
    const detailText = document.getElementById('detailText');         // Detay açıklaması
    const detailModel = document.getElementById('detailModel');       // 3D model
    const detailMap = document.getElementById('detailMap');           // Sokak görünümü iframe

    /* -------------------------------------------------------
       ESER VERİLERİ
       Her eserin başlığı, konumu, varlık yolları ve sokak
       görünümü (Street View) için kamera koordinatları burada
       tutulur. Detay ekranı açıldığında ilgili dosyalar
       tembel (lazy) olarak yüklenir.
    ------------------------------------------------------- */
    const artifactData = {
        yagibasan: {
            title: 'Yağıbasan Medresesi',
            location: '📍 Tokat / Niksar',
            model: 'assets/models/yagibasan-medresesi.glb',
            // Etkileşimli Sokak Görünümü kamera koordinatları (enlem, boylam)
            lat: 40.3153467,
            lng: 36.5458488,
            customPanoEmbed: '<iframe src="https://www.google.com/maps/embed?pb=!4v1791823540663!6m8!1m7!1sCAoSHENJQUJJaEJkU2xTdDNqcEN2NThsdnlLcmt3N0M.!2m2!1d40.31559323418111!2d36.54619234782928!3f251.92008654928821!4f10.979910508888125!5f0.4000000000000002" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
        },
        niksar: {
            title: 'Niksar Ulu Camii',
            location: '📍 Tokat / Niksar',
            model: 'assets/models/niksar-ulu-camii.glb',
            panorama: 'assets/panoramas/niksar-360.png',
            // Etkileşimli Sokak Görünümü kamera koordinatları (enlem, boylam)
            lat: 40.5892042,
            lng: 36.9603195
        },
        caglayan: {
            title: 'Çağlayan Köprüsü',
            location: '📍 Amasya',
            model: 'assets/models/caglayan-koprusu.glb',
            image: 'assets/images/caglayan-koprusu.jpg',
            // Etkileşimli Sokak Görünümü kamera koordinatları (enlem, boylam)
            lat: 40.61826,
            lng: 35.8115841
        }
    };

    /* -------------------------------------------------------
       ETKİLEŞİMLİ GOOGLE STREET VIEW ADRESİ OLUŞTUR
       layer=c        : Sokak Görünümü katmanını etkinleştirir
       cbll           : Street View kamerasının konumu (enlem,boylam)
       cbp            : Kamera açısı / yakınlaştırma parametreleri
       output=svembed : Gömülü (embed) Street View görünümü üretir
       Böylece kullanıcı fare veya dokunmatik ile sokakta gezinebilir.
    ------------------------------------------------------- */
    function buildStreetViewUrl(lat, lng) {
        const params = [
            'layer=c',
            'cbll=' + lat + ',' + lng,
            'cbp=11,0,0,0,0',
            'output=svembed',
            'hl=tr'
        ];
        return 'https://www.google.com/maps?' + params.join('&');
    }

    /* -------------------------------------------------------
       SPA BÖLÜM DEĞİŞTİRME
       İlgili bölüme .active sınıfı verilir, diğerleri kaldırılır.
    ------------------------------------------------------- */
    function showSection(sectionId) {
        // Hedef bölümün var olup olmadığını kontrol et
        const target = document.getElementById(sectionId);
        if (!target) return;

        // Tüm bölümlerden .active sınıfını kaldır
        sections.forEach(function (section) {
            section.classList.remove('active');
        });

        // Yalnızca hedef bölüme .active sınıfını ver
        target.classList.add('active');

        // Eserler bölümünden çıkılıyorsa detay görünümünü sıfırla
        if (sectionId !== 'eserler') {
            resetArtifactView();
        }

        // Menü butonlarında aktif durumu güncelle
        navButtons.forEach(function (btn) {
            if (btn.classList.contains('nav-btn')) {
                btn.classList.toggle('active', btn.dataset.section === sectionId);
            }
        });

        // Sayfayı en üste kaydır (yumuşak geçişle)
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // URL hash'ini güncelle (tarayıcı geçmişine uyumlu yönlendirme)
        history.replaceState(null, '', '#' + sectionId);

        // Görünürlük gerektiren bileşenlere (3D / panorama) bildir
        document.dispatchEvent(new CustomEvent('sectionchange', {
            detail: { id: sectionId }
        }));
    }

    // Tüm yönlendirme butonlarına tıklama olayı ekle
    navButtons.forEach(function (btn) {
        btn.addEventListener('click', function (event) {
            event.preventDefault();
            showSection(btn.dataset.section);

            // Mobil menü açık ise seçtikten sonra kapat
            if (navMenu.classList.contains('open')) {
                toggleMenu(false);
            }
        });
    });

    /* -------------------------------------------------------
       ESER DETAY EKRANINI AÇ
       Liste gizlenir, detay görünür; 3D, 360° ve harita
       yalnızca bu aşamada (tembel olarak) yüklenir.
    ------------------------------------------------------- */
    function openArtifact(key) {
        const data = artifactData[key];
        if (!data) return;

        // Metin alanlarını doldur
        detailTitle.textContent = data.title;
        detailLocation.textContent = data.location;
        detailText.textContent = 'Yapılacak';

        // 3D modelin erişilebilirlik metnini güncelle
        if (detailModel) {
            detailModel.setAttribute('alt', data.title + ' 3D Model');
            detailModel.removeAttribute('auto-rotate');
            const toggleBtn = document.getElementById('toggleAutoRotateBtn');
            if (toggleBtn) {
                toggleBtn.textContent = '🔄 Otomatik Dönme: Kapalı';
                toggleBtn.style.backgroundColor = '#f0f0f0';
                toggleBtn.style.color = '#333';
            }
        }

        // Haritayı / sokak görünümünü ayarla (etkileşimli Street View)
        if (detailMap) {
            detailMap.setAttribute('src', buildStreetViewUrl(data.lat, data.lng));
        }

        // Görünürlük geçişi: liste gizle, detay göster
        artifactList.classList.add('is-hidden');
        artifactDetail.classList.add('active');
        artifactDetail.setAttribute('aria-hidden', 'false');

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 3D modeli yükle (viewer3d.js içindeki global fonksiyon)
        if (typeof loadModelViewer === 'function') {
            loadModelViewer(detailModel, data.model);
        }

        const panoContainer = document.getElementById('detailPano');
        if (panoContainer) {
            if (data.customPanoEmbed) {
                if (typeof stopDetailPanorama === 'function') stopDetailPanorama();
                panoContainer.innerHTML = data.customPanoEmbed;
            } else if (data.video) {
                if (typeof stopDetailPanorama === 'function') stopDetailPanorama();
                panoContainer.innerHTML = `<video controls class="artifact-video-player" preload="metadata"><source src="${data.video}" type="video/mp4"></video>`;
            } else if (data.image) {
                // Eğer köprü gibi dış mekan eseri için fotoğraf tanımlandıysa:
                if (typeof stopDetailPanorama === 'function') stopDetailPanorama();
                panoContainer.innerHTML = `
                    <div class="artifact-photo-showcase">
                        <img src="${data.image}" alt="${data.title} Mimari Görseli" loading="lazy">
                    </div>
                `;
            } else {
                setTimeout(function () {
                    if (typeof loadDetailPanorama === 'function') {
                        loadDetailPanorama(data.panorama);
                    }
                }, 120);
            }
        }
    }

    /* -------------------------------------------------------
       ESER DETAY EKRANINI KAPAT
       Detay gizlenir, liste tekrar görünür olur ve kaynaklar
       serbest bırakılır (performans).
    ------------------------------------------------------- */
    function closeArtifact() {
        artifactDetail.classList.remove('active');
        artifactDetail.setAttribute('aria-hidden', 'true');
        artifactList.classList.remove('is-hidden');

        // 360° panoramanın otomatik dönüşünü durdur
        if (typeof stopDetailPanorama === 'function') {
            stopDetailPanorama();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Detay açıkken bölüm değişirse listeye geri dön
    function resetArtifactView() {
        if (artifactDetail.classList.contains('active')) {
            closeArtifact();
        } else if (artifactList) {
            artifactList.classList.remove('is-hidden');
        }
    }

    // Eser liste butonlarına tıklama olayı ekle
    const listItems = document.querySelectorAll('.artifact-list-item');
    listItems.forEach(function (item) {
        item.addEventListener('click', function () {
            openArtifact(item.dataset.artifact);
        });
    });

    // Geri dön butonu
    if (detailBack) {
        detailBack.addEventListener('click', function () {
            closeArtifact();
        });
    }

    /* -------------------------------------------------------
       MOBİL HAMBURGER MENÜ AÇ/KAPAT
    ------------------------------------------------------- */
    function toggleMenu(force) {
        // force parametresi verilirse zorla, verilmezse durumu tersine çevir
        const isOpen = typeof force === 'boolean'
            ? force
            : !navMenu.classList.contains('open');

        navMenu.classList.toggle('open', isOpen);
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    }

    hamburger.addEventListener('click', function () {
        toggleMenu();
    });

    // Pencere genişliği masaüstüne dönerse menüyü kapat
    window.addEventListener('resize', function () {
        if (window.innerWidth > 900 && navMenu.classList.contains('open')) {
            toggleMenu(false);
        }
    });

    /* -------------------------------------------------------
       İLK YÜKLEME: URL hash'ine göre ilgili bölümü göster
    ------------------------------------------------------- */
    const initialId = location.hash.replace('#', '');
    if (initialId && document.getElementById(initialId)) {
        showSection(initialId);
    } else {
        // Varsayılan olarak Ana Sayfa aktiftir; yine de olayı yay
        document.dispatchEvent(new CustomEvent('sectionchange', {
            detail: { id: 'ana-sayfa' }
        }));
    }
});
