# YDS Kelime Kartları (PWA)

YDS sınavına hazırlananlar için aralıklı tekrar (spaced repetition), mini test ve ilerleme yedekleme özelliklerine sahip hafif ve hızlı bir Progressive Web App (PWA).

## 🚀 Özellikler

- **Aralıklı Tekrar (Spaced Repetition):** Kelimeleri öğrenme durumunuza göre 1, 3, 7 ve 14 gün aralıklarla tekrar ettirir.
- **Çevrimdışı Çalışma (Offline First):** Service Worker sayesinde internet bağlantınız olmasa bile çalışır.
- **Mobil ve Masaüstü Kurulumu:** PWA desteği ile telefonunuza veya bilgisayarınıza bir uygulama gibi yüklenebilir.
- **Mini Test:** Her 20 kelimede bir mini test ile bilginizi pekiştirir.
- **Yedekleme & Geri Yükleme:** İlerlemenizi tek tıkla JSON dosyası olarak kaydedebilir veya başka bir cihaza aktarabilirsiniz.
- **Sıfır Bağımlılık (Vanilla JS/HTML/CSS):** Hiçbir paket yöneticisi veya derleyiciye (build tool) ihtiyaç duymaz.

---

## 🌐 GitHub Pages ile Canlıya Alma Rehberi

Bu proje GitHub Pages ile tam uyumludur. Yayına almak için aşağıdaki adımları uygulayın:

### 1. GitHub'da Yeni Bir Depo (Repository) Oluşturun
1. [GitHub](https://github.com) hesabınıza giriş yapın.
2. Sağ üstteki **+** ikonuna tıklayıp **New repository** seçeneğini seçin.
3. Depo adını girin (Örn: `yds-kelime-kartlari`).
4. **Public** seçin ve *README / .gitignore eklemeden* boş olarak oluşturun.

### 2. Projeyi GitHub'a Gönderin
Terminalde (PowerShell) proje dizinindeyken şu komutları çalıştırın (kendi kullanıcı adınızı yazın):

```bash
git remote add origin https://github.com/<kullanici-adiniz>/yds-kelime-kartlari.git
git push -u origin main
```

### 3. GitHub Pages Ayarını Yapın
1. GitHub reponuzda **Settings** sekmesine gidin.
2. Sol menüden **Pages** bölümüne tıklayın.
3. **Build and deployment > Source** alanını **GitHub Actions** olarak seçin.
4. Birkaç dakika içinde Actions iş akışı tamamlanacak ve sayfanız `https://<kullanici-adiniz>.github.io/yds-kelime-kartlari/` adresinde yayına girecektir.

---

## 💻 Yerel Geliştirme (Local Development)

Projeyi bilgisayarınızda yerel olarak çalıştırmak için statik bir sunucu kullanabilirsiniz:

```bash
# Python ile:
python -m http.server 8000

# veya Node.js / npx ile:
npx serve .
```

Ardından tarayıcınızdan `http://localhost:8000` adresine gidin.
