export interface Lesson {
  id: string;
  title: string;
  text: string;
  language: 'uz' | 'ru';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const lessons: Lesson[] = [
  // UZBEK LESSONS — barcha apostrof va tire belgilari olib tashlandi
  {
    id: 'uz-1',
    title: 'Texnologiya va jamiyat rivojlanishi',
    text: 'Bugungi kunda texnologiyalar hayotimizning har bir jabhasiga shiddat bilan kirib bormoqda. Kompyuterlar, smartfonlar va internet bizga masofadan turib ishlash, sifatli talim olish hamda dunyoning istalgan nuqtasidagi yaqinlarimiz bilan aloqada bolish imkoniyatini taqdim etmoqda.',
    language: 'uz',
    difficulty: 'Beginner'
  },
  {
    id: 'uz-2',
    title: 'Kitobxonlik va inson kamoloti',
    text: 'Kitob insonning eng yaqin dosti, uning manaviy dunyosini boyituvchi va fikrlash doirasini kengaytiruvchi bebaho manbaidir. Har kuni oz bolsa ham kitob oqish orqali biz nafaqat yangi bilimlarni egallaymiz, balki nutq boyligimiz va tahliliy tafakkurimizni ham shakllantiramiz.',
    language: 'uz',
    difficulty: 'Intermediate'
  },
  {
    id: 'uz-3',
    title: 'Ozbekiston tabiati va ekologiya',
    text: 'Yashil tabiatni asrash va ekologik muvozanatni saqlash har birimizning fuqarolik burchimizdir. Daraxtlar ekish, suv resurslaridan tejamkorlik bilan foydalanish va chiqindilarni saralash orqali biz kelajak avlodlar uchun toza, soglom va obod atrof muhitni meros qilib qoldirishimiz mumkin.',
    language: 'uz',
    difficulty: 'Intermediate'
  },
  {
    id: 'uz-4',
    title: 'Talim va shaxsiy rivojlanish',
    text: 'Muvaffaqiyat kaliti doimiy izlanish va yangi konikmalarni ozlashtirishda yotadi. Zamonaviy dunyoda bilim faqat maktab yoki universitet bilan cheklanmaydi, balki butun umr davomida organishni talab etadi. Oz ustida ishlash insonni har doim yangi marralarga yetaklaydi.',
    language: 'uz',
    difficulty: 'Advanced'
  },
  {
    id: 'uz-5',
    title: 'Soglom turmush tarzi sirlari',
    text: 'Soglom hayot kechirish togri ovqatlanish, muntazam ravishda jismoniy tarbiya bilan shugullanish va ruhiy xotirjamlikka bogliqdir. Har kuni jismoniy mashqlarga vaqt ajratish, yetarli darajada uxlash va stressdan uzoq bolish tanamizning uzoq vaqt faol bolishini taminlaydi.',
    language: 'uz',
    difficulty: 'Advanced'
  },

  // RUSSIAN LESSONS — o'zgarishsiz
  {
    id: 'ru-1',
    title: 'Evolyutsiya tsifrovogo mira',
    text: 'Sovremennye tekhnologii menyayut nash privychnyy obraz zhizni s neveroyadnoy skorostyu. Kompyutery i globalnaya set pozvolyayut nam effektivno uchitsya, rabotat iz lyuboy tochki mira i obshchatsya s lyudmi iz raznykh stran i kultur v rezhime realnogo vremeni.',
    language: 'ru',
    difficulty: 'Beginner'
  },
  {
    id: 'ru-2',
    title: 'Velikaya sila literatury',
    text: 'Khoroshaya kniga yavlyayetsya mudrym sovetchikomі vernym sputnikom cheloveka. Chteniye klassicheskoy literatury rasshiryayet nash krugozor, razvivayet tvorcheskoye voobrazheniye, pomogayet luchshe ponimat slozhnyye chelovecheskiye chuvstva, motivy postupkov i zhiznennyye tsennosti.',
    language: 'ru',
    difficulty: 'Intermediate'
  },
  {
    id: 'ru-3',
    title: 'Zashchita ekologii Zemli',
    text: 'Sokhraneniye unikalnoy prirody nashey planety yavlyayetsya vazhneyshey zadachey dlya vsego chelovechestva. Berezhnoye ispolzovaniye chistoy vody, posadka zelenykh nasazhdeniy i gramotnaya sortirovka otkhodov pomogut sberecht prekrasnyy okruzhayushchiy mir dlya budushchikh pokoleniy.',
    language: 'ru',
    difficulty: 'Intermediate'
  },
  {
    id: 'ru-4',
    title: 'Vazhnost nepreryvnogo obrazovaniya',
    text: 'Polucheniye glubokikh znaniy i postoyannoye samorazvitiye otkryvayut pered kazhdym chelovekom ogromnyye zhiznennyye perspektivy. Obrazovaniye segodnya ne zakanchivaetsya diplomom, ono prodolzhayetsya vsyu zhizn, pomogaya nam adaptirovatya k bystro menyayushchimsya usloviyam.',
    language: 'ru',
    difficulty: 'Advanced'
  },
  {
    id: 'ru-5',
    title: 'Osnovy zdorovogo obraza zhizni',
    text: 'Krepkoye zdorovye yavlyayetsya glavnym bogatstvom kazhdogo cheloveka. Regulyarnyye umerennyye fizicheskiye nagruzki, sbalansirovannoye pitaniye i polnotsenny nochnoj otdykh pozvolyayut podderzhivat otlichnuyu produktivnost, bodrost dukha i prekrasnoye samochuvstviye yezhednevno.',
    language: 'ru',
    difficulty: 'Advanced'
  }
];
