function SmartBank() {
  const bank = {
    Musteriler: [],

    // MÜŞTERİ EKLE
    MusteriEkle: function (isim, yas, sifre, bakiye) {
      const YeniMusteri = {
        isim,
        yas,
        sifre,
        bakiye,
        gunlukIslemLimiti: 5000,
        riskPuani: 0,
        islemGecmisi: [],
      };

      this.Musteriler.push(YeniMusteri);
      return `${isim} başarıyla eklendi.`;
    },

    // GİRİŞ
    login: function (isim, sifre) {
      for (let i = 0; i < this.Musteriler.length; i++) {
        const Musteri = this.Musteriler[i];
        if (Musteri.isim === isim && Musteri.sifre === sifre) {
          return `Hoşgeldin ${isim}, giriş başarılı.`;
        }
      }
      return "Üzgünüz, şifre hatalı. Tekrar deneyin.";
    },

    // PARA YATIRMA
    deposit: function (isim, miktar) {
      for (let i = 0; i < this.Musteriler.length; i++) {
        const Musteri = this.Musteriler[i];

        if (Musteri.isim === isim) {
          Musteri.bakiye += miktar;
          Musteri.islemGecmisi.push({
            tip: "deposit",
            miktar,
            tarih: new Date(),
          });

          return `${miktar} TL yatırıldı. Yeni bakiye: ${Musteri.bakiye}`;
        }
      }
      return `Müşteri bulunamadı.`;
    },

    // PARA ÇEKME
    withdraw: function (isim, miktar) {
      for (let i = 0; i < this.Musteriler.length; i++) {
        const Musteri = this.Musteriler[i];

        if (Musteri.isim === isim) {
          if (miktar > Musteri.bakiye) {
            // Log failed withdraw for risk calculation
            Musteri.islemGecmisi.push({ tip: 'withdraw-failed', miktar, reason: 'insufficient', tarih: new Date() });
            return `Yetersiz bakiye.`;
          }

          if (miktar > Musteri.gunlukIslemLimiti) {
            Musteri.islemGecmisi.push({ tip: 'withdraw-failed', miktar, reason: 'limit', tarih: new Date() });
            return `Günlük işlem limiti aşıldı.`;
          }

          Musteri.bakiye -= miktar;
          Musteri.gunlukIslemLimiti -= miktar;

          Musteri.islemGecmisi.push({
            tip: 'withdraw',
            miktar,
            tarih: new Date(),
          });

          return `${miktar} TL çekildi. Yeni bakiye: ${Musteri.bakiye}`;
        }
      }

      return `Müşteri bulunamadı.`;
    },

    // PARA TRANSFERİ
    transfer: function (gonderen, alici, miktar) {
      let gonderenMusteri = null;
      let aliciMusteri = null;

      // 1) Göndereni bul
      for (let i = 0; i < this.Musteriler.length; i++) {
        const Musteri = this.Musteriler[i];
        if (Musteri.isim === gonderen) {
          gonderenMusteri = Musteri;
          break;
        }
      }

      // 2) Alıcıyı bul
      for (let i = 0; i < this.Musteriler.length; i++) {
        const Musteri = this.Musteriler[i];
        if (Musteri.isim === alici) {
          aliciMusteri = Musteri;
          break;
        }
      }

      if (!gonderenMusteri || !aliciMusteri) {
        return 'Gönderen veya alıcı bulunamadı.';
      }

      if (miktar > gonderenMusteri.bakiye) {
        return 'Yetersiz bakiye.';
      }

      if (miktar > gonderenMusteri.gunlukIslemLimiti) {
        return 'Günlük işlem limiti aşıldı.';
      }

      gonderenMusteri.bakiye -= miktar;
      gonderenMusteri.gunlukIslemLimiti -= miktar;
      aliciMusteri.bakiye += miktar;

      gonderenMusteri.islemGecmisi.push({ tip: 'transfer-out', miktar, tarih: new Date(), to: alici });
      aliciMusteri.islemGecmisi.push({ tip: 'transfer-in', miktar, tarih: new Date(), from: gonderen });

      return `${miktar} TL transfer edildi. Yeni bakiye: ${gonderenMusteri.bakiye}`;
    },

    // KREDİ
    takeLoan: function(isim, miktar) {
      for (let i = 0; i < this.Musteriler.length; i++) {
        const Musteri = this.Musteriler[i];
        if (Musteri.isim === isim) {
          Musteri.bakiye += miktar;
          Musteri.islemGecmisi.push({ tip: 'loan', miktar, tarih: new Date() });
          return `${miktar} TL kredi verildi. Yeni bakiye: ${Musteri.bakiye}`;
        }
      }
      return 'Müşteri bulunamadı.';
    },

    // FAİZ EKLE
    addInterest: function(isim) {
      const Musteri = this.Musteriler.find(m => m.isim === isim);
      if (!Musteri) return 'Müşteri bulunamadı.';
      const faiz = +(Musteri.bakiye * 0.02).toFixed(2);
      Musteri.bakiye += faiz;
      Musteri.islemGecmisi.push({ tip: 'faiz islendi', miktar: faiz, tarih: new Date() });
      return `Faiz uygulandı: ${faiz} TL. Yeni bakiye: ${Musteri.bakiye}`;
    },

    // RİSK HESAPLA
    calculateRisk: function(isim) {
      const Musteri = this.Musteriler.find(m => m.isim === isim);
      if (!Musteri) return null;
      let risk = 0;
      for (const islem of Musteri.islemGecmisi) {
        const tip = String(islem.tip || '');
        if (tip.includes('-')) risk += 1;
        if (tip.toLowerCase().includes('loan')) risk += 2;
        if (tip === 'withdraw-failed') risk += 3;
      }
      Musteri.riskPuani = risk;
      return risk;
    },

    // RİSK DURUMU
    checkStatus: function(isim) {
      const Musteri = this.Musteriler.find(m => m.isim === isim);
      if (!Musteri) return 'Müşteri bulunamadı.';
      const risk = this.calculateRisk(isim);
      if (risk <= 2) return 'dusuk risk';
      if (risk <= 5) return 'orta risk';
      return 'yuksek risk';
    },

    // RAPOR
    getReport: function(isim) {
      const Musteri = this.Musteriler.find(m => m.isim === isim);
      if (!Musteri) return 'Müşteri bulunamadı.';
      const report = [];
      report.push(`=== ${Musteri.isim} RAPORU ===`);
      report.push(`Isim: ${Musteri.isim}`);
      report.push(`Yas: ${Musteri.yas}`);
      report.push(`Bakiye: ${Musteri.bakiye} TL`);
      report.push(`Gunluk Limit: ${Musteri.gunlukIslemLimiti} TL`);
      report.push(`Risk Puani: ${Musteri.riskPuani || 0}`);
      report.push('--- Islem Gecmisi ---');
      for (const islem of Musteri.islemGecmisi) {
        const parts = [];
        parts.push(islem.tip);
        if (islem.miktar !== undefined) parts.push(`${islem.miktar} TL`);
        if (islem.to) parts.push(`to:${islem.to}`);
        if (islem.from) parts.push(`from:${islem.from}`);
        if (islem.reason) parts.push(`(${islem.reason})`);
        report.push('  ' + parts.join(' | '));
      }
      return report.join('\n');
    },

    // MÜŞTERİ BUL
    musteriBul: function(isim) {
      return this.Musteriler.find(m => m.isim === isim) || null;
    }
  };

  return bank;
}

// ===== DEMO/TEST =====
console.log('=== SMARTBANK DEMO ===\n');

const app = SmartBank();

// Müşteri ekle
console.log(app.MusteriEkle('Ayse', 35, 'pw1', 5000));
console.log(app.MusteriEkle('Veli', 40, 'pw2', 1500));
console.log('');

// Para yatır
console.log(app.deposit('Ayse', 1000));
console.log('');

// Para çek (yetersiz)
console.log(app.withdraw('Veli', 2000)); // failed
console.log('');

// Transfer
console.log(app.transfer('Ayse', 'Veli', 700));
console.log('');

// Faiz ekle
console.log(app.addInterest('Ayse'));
console.log('');

// Risk hesapla
console.log('Ayse risk puani:', app.calculateRisk('Ayse'));
console.log('Ayse durumu:', app.checkStatus('Ayse'));
console.log('');

// Rapor
console.log(app.getReport('Ayse'));
