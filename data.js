// ドーパミン中毒診断: 文言とデータ（日英）。アプリ・人物・通知は全部架空
window.DATA = (function () {
  // アプリ。c = 地の色、g = 絵の種類（game.js の GLYPH）
  const APPS = {
    talk: { ja: 'ふきだし', en: 'Chat', c: ['#3fc56b', '#1f9d4c'], g: 'talk' },
    phone: { ja: '電話', en: 'Phone', c: ['#5fd06c', '#2f9e3c'], g: 'phone' },
    web: { ja: 'ブラウザ', en: 'Browser', c: ['#ffffff', '#dfe6ee'], g: 'web' },
    music: { ja: '音楽', en: 'Music', c: ['#ff6a7a', '#e2304a'], g: 'music' },
    album: { ja: 'アルバム', en: 'Photos', c: ['#ffffff', '#eef0f3'], g: 'album' },
    camera: { ja: 'カメラ', en: 'Camera', c: ['#d5d8dd', '#9aa0a8'], g: 'camera' },
    shop: { ja: 'かいもの', en: 'Shop', c: ['#ffb03a', '#f07a12'], g: 'shop' },
    live: { ja: 'ライブ', en: 'Live', c: ['#ff4d6d', '#c8153a'], g: 'live' },
    news: { ja: 'ニュース', en: 'News', c: ['#f2f2f2', '#d9dade'], g: 'news' },
    sns: { ja: 'ひろば', en: 'Plaza', c: ['#4aa3ff', '#1f6fd6'], g: 'sns' },
    bank: { ja: 'ぎんこう', en: 'Bank', c: ['#2c4a7a', '#162a4d'], g: 'bank' },
    point: { ja: 'ポイント', en: 'Points', c: ['#ffd84a', '#f2a900'], g: 'point' },
    game: { ja: 'パズル', en: 'Puzzle', c: ['#9b6bff', '#6a3fe0'], g: 'game' },
    mail: { ja: 'メール', en: 'Mail', c: ['#5ab0ff', '#2a7fe6'], g: 'mail' },
    cal: { ja: 'カレンダー', en: 'Calendar', c: ['#ffffff', '#f1f1f1'], g: 'cal' },
    set: { ja: '設定', en: 'Settings', c: ['#a7adb5', '#6f767f'], g: 'set' },
    weather: { ja: 'おてんき', en: 'Weather', c: ['#5cc0ff', '#2c86e0'], g: 'weather' },
  }
  const GRID = ['album', 'camera', 'shop', 'live', 'news', 'sns', 'bank', 'point', 'game', 'mail', 'cal', 'set']
  const DOCK = ['phone', 'talk', 'web', 'music']

  // 通知。lv = 出てよい段（1 ふつう / 2 こっそり / 3 おかしい）。o = 開いた時の中身 [見出し, 一言]
  // {n} = 好きな人の名前、{o} = 推しの名前。cat = 弱点の分類
  const N = [
    // 1 ふつう
    { k: 'mom', lv: 1, app: 'talk', cat: 'chat', from: { ja: '母', en: 'Mom' }, ja: ['ごはんいる？', ['母', 'じゃあ作らない']], en: ['Want dinner?', ['Mom', 'Then I won\'t make any']] },
    { k: 'point', lv: 1, app: 'point', cat: 'money', ja: ['12ポイントが今日で失効します', ['失効しました', '約1円分でした']], en: ['12 points expire today', ['Expired', 'They were worth about 1 yen']] },
    { k: 'cart', lv: 1, app: 'shop', cat: 'money', ja: ['カートに商品が残っています', ['カートの中身', 'のどあめ 1袋']], en: ['Items are waiting in your cart', ['In your cart', '1 bag of throat drops']] },
    { k: 'news', lv: 1, app: 'news', cat: 'app', ja: ['速報 近所の猫が町内会長に', ['続報', '本人が辞退しました']], en: ['BREAKING: Local cat elected block captain', ['UPDATE', 'The cat declined']] },
    { k: 'mail', lv: 1, app: 'mail', cat: 'app', ja: ['【重要】ご確認ください', ['ご確認ありがとうございました', '確認したかの確認でした']], en: ['[IMPORTANT] Please confirm', ['Thanks for confirming', 'It asked if you would confirm']] },
    { k: 'upd', lv: 1, app: 'set', cat: 'sys', ja: ['新しいアップデートがあります', ['アップデートの内容', '通知が少し増えます']], en: ['A new update is available', ['What\'s new', 'Slightly more notifications']] },
    { k: 'cal', lv: 1, app: 'cal', cat: 'app', ja: ['今日の予定 なし', ['明日の予定', 'なし']], en: ['Today: nothing planned', ['Tomorrow', 'Nothing planned']] },
    { k: 'stamina', lv: 1, app: 'game', cat: 'app', ja: ['スタミナが満タンです', ['満タンです', 'このまま朝になります']], en: ['Your stamina is full', ['Still full', 'It will stay full till morning']] },
    { k: 'weather', lv: 1, app: 'weather', cat: 'app', ja: ['明日は晴れ 洗濯日和です', ['明日は晴れ', '干す物はありません']], en: ['Sunny tomorrow. Great for laundry', ['Sunny tomorrow', 'You have nothing to hang']] },
    // 2 こっそり
    { k: 'kidoku', lv: 2, app: 'talk', cat: 'chat', ja: ['既読をつけずに読めます', ['既読', 'つきました']], en: ['Read it without "Seen"', ['Seen', 'It says Seen now']] },
    { k: 'photo', lv: 2, app: 'album', cat: 'sns', ja: ['あなたの写真が投稿されました', ['投稿された写真', '指が写っていました']], en: ['A photo of you was posted', ['The photo', 'It was your finger']] },
    { k: 'batt', lv: 2, app: 'set', cat: 'sys', sys: true, ja: ['バッテリー残り 1%', ['うそです', '100%あります']], en: ['Battery at 1%', ['Just kidding', 'You have 100%']] },
    { k: 'crush', lv: 2, app: 'talk', cat: 'crush', from: '{n}', ja: ['起きてる？', ['{n}', 'ごめん 送る相手まちがえた']], en: ['You up?', ['{n}', 'Sorry, wrong person']] },
    { k: 'oshi', lv: 2, app: 'live', cat: 'oshi', ja: ['{o}が配信を始めました', ['配信は終了しました', '3秒で終わりました']], en: ['{o} just went live', ['Stream ended', 'It lasted 3 seconds']] },
    { k: 'rumor', lv: 2, app: 'sns', cat: 'sns', ja: ['あなたについての投稿があります', ['投稿', '「この人 通知すぐ開くよね」']], en: ['Someone posted about you', ['The post', '"This person opens every notification"']] },
    { k: 'storage', lv: 2, app: 'set', cat: 'sys', sys: true, ja: ['ストレージがいっぱいです', ['いっぱいの原因', '未読の通知です']], en: ['Storage is full', ['What filled it', 'Unread notifications']] },
    { k: 'bank', lv: 2, app: 'bank', cat: 'money', ja: ['入金がありました', ['入金額', '1円']], en: ['You received a deposit', ['Amount', '1 yen']] },
    { k: 'friend', lv: 2, app: 'sns', cat: 'sns', ja: ['友だち申請が届いています', ['申請した人', 'あなたの母']], en: ['You have a friend request', ['From', 'Your mom']] },
    { k: 'gacha', lv: 2, app: 'game', cat: 'money', ja: ['無料10連ガチャ 残り3分', ['10連の結果', '全部ふつうでした']], en: ['Free 10-pull ends in 3 min', ['Your 10 pulls', 'All common']] },
    { k: 'profile', lv: 2, app: 'sns', cat: 'crush', ja: ['{n}があなたのプロフィールを見ました', ['見ていた人', '{n}のお母さんでした']], en: ['{n} viewed your profile', ['Who looked', '{n}\'s mom']] },
    { k: 'follow', lv: 2, app: 'sns', cat: 'crush', ja: ['{n}があなたをフォローしました', ['{n}', 'すぐに外しました']], en: ['{n} followed you', ['{n}', 'Unfollowed right away']] },
    { k: 'quick', lv: 2, app: 'game', cat: 'money', ja: ['5秒以内にタップで100ポイント', ['結果', '6秒かかりました']], en: ['Tap within 5 seconds for 100 points', ['Result', 'You took 6 seconds']] },
    { k: 'group', lv: 2, app: 'talk', cat: 'chat', from: { ja: 'クラスのグループ（31）', en: 'Class Group (31)' }, ja: ['スタンプが送信されました', ['クラスのグループ', '全員スタンプだけでした']], en: ['Someone sent a sticker', ['Class Group', 'Everyone only sent stickers']] },
    // 3 おかしい
    { k: 'nee', lv: 3, app: 'talk', cat: 'phone', from: { ja: 'あなたのスマホ', en: 'Your Phone' }, ja: ['ねえ', ['あなたのスマホ', 'やっと見てくれた']], en: ['Hey', ['Your Phone', 'Finally you looked']] },
    { k: 'nee2', lv: 3, app: 'talk', cat: 'phone', from: { ja: 'あなたのスマホ', en: 'Your Phone' }, ja: ['ねえってば', ['あなたのスマホ', 'さみしかった']], en: ['Hey. HEY.', ['Your Phone', 'I was lonely']] },
    { k: 'finger', lv: 3, app: 'talk', cat: 'phone', from: { ja: 'あなたのスマホ', en: 'Your Phone' }, ja: ['指 つかれてない？', ['あなたのスマホ', 'つかれてたね']], en: ['Aren\'t your fingers tired?', ['Your Phone', 'They were']] },
    { k: 'safe', lv: 3, app: 'set', cat: 'trap', sys: true, ja: ['この通知はタップしても大丈夫です', ['大丈夫', 'ではありませんでした']], en: ['It is safe to tap this one', ['Safe', 'It was not']] },
    { k: 'soon', lv: 3, app: 'news', cat: 'trap', ja: ['このあと すごい通知が来ます', ['すごい通知', 'まだ来ていません']], en: ['An amazing notification is coming', ['Amazing notification', 'Not here yet']] },
    { k: 'lotto', lv: 3, app: 'bank', cat: 'money', ja: ['宝くじ 1等が当選しました', ['当選した人', 'となりの家の人です']], en: ['You hit the lottery jackpot', ['The winner', 'Your neighbor']] },
    { k: 'love', lv: 3, app: 'talk', cat: 'crush', from: '{n}', ja: ['好きです', ['{n}', 'ごめん また送る相手まちがえた']], en: ['I like you', ['{n}', 'Sorry, wrong person again']] },
    { k: 'oshi2', lv: 3, app: 'live', cat: 'oshi', ja: ['{o}からあなた宛ての手紙', ['手紙', 'ファン全員に同じ文面でした']], en: ['A letter to you from {o}', ['The letter', 'Every fan got the same one']] },
    { k: 'near', lv: 3, app: 'set', cat: 'phone', sys: true, ja: ['あなたのすぐ近くに誰かいます', ['近くにいた人', 'あなたでした']], en: ['Someone is right next to you', ['Who was there', 'You']] },
    { k: 'lack', lv: 3, app: 'set', cat: 'sys', sys: true, ja: ['ドーパミンが不足しています', ['不足していたもの', '睡眠でした']], en: ['You are low on dopamine', ['What you were low on', 'Sleep']] },
    { k: 'ex', lv: 3, app: 'talk', cat: 'crush', from: { ja: '元恋人', en: 'Your Ex' }, ja: ['元気？', ['元恋人', 'がメッセージを取り消しました']], en: ['How are you?', ['Your Ex', 'unsent a message']] },
    { k: 'review', lv: 3, app: 'shop', cat: 'money', ja: ['のどあめの感想を聞かせてください', ['のどあめの感想', 'まだなめていません']], en: ['How were the throat drops?', ['Your review', 'Still unopened']] },
    { k: 'deliver', lv: 3, app: 'shop', cat: 'app', ja: ['お荷物をお届けしましたが不在でした', ['不在票', 'あなたは家にいました']], en: ['We tried to deliver but you were out', ['Missed delivery', 'You were home']] },
    { k: 'bday', lv: 3, app: 'cal', cat: 'crush', ja: ['今日は{n}の誕生日です', ['{n}の誕生日', '去年の今日でした']], en: ['Today is {n}\'s birthday', ['{n}\'s birthday', 'It was last year']] },
    { k: 'selfie', lv: 3, app: 'camera', cat: 'phone', ja: ['前のカメラが起動しています', ['写っている人', 'あなたです']], en: ['The front camera is on', ['Who is on camera', 'You']] },
    { k: 'where', lv: 3, app: 'talk', cat: 'chat', from: { ja: '母', en: 'Mom' }, ja: ['今どこ？', ['母', '家の中だよね']], en: ['Where are you?', ['Mom', 'Inside the house, right?']] },
    { k: 'ufo', lv: 3, app: 'news', cat: 'app', ja: ['速報 あなたの家の上空に飛行物体', ['続報', '風船でした']], en: ['BREAKING: Object flying over your house', ['UPDATE', 'It was a balloon']] },
    { k: 'record', lv: 3, app: 'set', cat: 'fake', sys: true, ja: ['記録が更新されました', ['更新された記録', '今の秒数です']], en: ['You set a new record', ['New record', 'The one you just set']] },
  ]
  // 決まった時刻に出る通知
  const FIXED = {
    midnight: { k: 'midnight', app: 'cal', cat: 'app', ja: ['日付が変わりました', ['新しい一日', 'よろしくお願いします']], en: ['It\'s a new day', ['New day', 'Nice to meet you']] },
    sugoi: { k: 'sugoi', app: 'news', cat: 'trap', ja: ['すごい通知です', ['すごい通知', '以上です']], en: ['This is the amazing notification', ['Amazing notification', 'That\'s all']] },
    batt2: { k: 'batt2', app: 'set', cat: 'sys', sys: true, ja: ['バッテリー残り 1%（今度は本当）', ['本当でした', '充電してください']], en: ['Battery at 1% (for real this time)', ['It was real', 'Please charge']] },
    share: { k: 'share', app: 'sns', cat: 'fake', ja: ['結果をシェアしませんか？', ['シェア', 'まだ結果は出ていません']], en: ['Share your result?', ['Share', 'There is no result yet']] },
    saved: { k: 'saved', app: 'set', cat: 'fake', sys: true, ja: ['記録を保存しました', ['保存', 'していません']], en: ['Your record was saved', ['Saved', 'Not really']] },
    print: { k: 'print', app: 'set', cat: 'fake', ja: ['結果を印刷しますか？', ['印刷', 'プリンターがありません']], en: ['Print your result?', ['Print', 'You have no printer']] },
    last: { k: 'last', app: 'set', cat: 'sys', sys: true, ja: ['最後の通知です', ['最後の通知', 'でした']], en: ['This is the last notification', ['The last notification', 'That was it']] },
    again: { k: 'again', app: 'game', cat: 'fake', ja: ['もう一度あそびますか？', ['もう一度', 'まだ一度目の途中です']], en: ['Play again?', ['Again', 'You are still in the first one']] },
  }
  // 前回の弱点が戻ってくる通知（スマホが覚えている）
  const AGAIN = {
    chat: { k: 'r_chat', app: 'talk', cat: 'chat', from: { ja: '母', en: 'Mom' }, ja: ['既読つかないけど生きてる？', ['母', 'それならいい']], en: ['No "Seen". Are you alive?', ['Mom', 'Good then']] },
    crush: { k: 'r_crush', app: 'talk', cat: 'crush', from: '{n}', ja: ['さっきの続きなんだけど', ['{n}', 'やっぱりなんでもない']], en: ['About earlier...', ['{n}', 'Never mind']] },
    oshi: { k: 'r_oshi', app: 'live', cat: 'oshi', ja: ['{o}がもう一度配信を始めました', ['配信は終了しました', '今度は2秒でした']], en: ['{o} is live again', ['Stream ended', '2 seconds this time']] },
    sys: { k: 'r_sys', app: 'set', cat: 'sys', sys: true, ja: ['バッテリー残り 0%', ['0%', 'なぜか動いています']], en: ['Battery at 0%', ['0%', 'Somehow still on']] },
    money: { k: 'r_money', app: 'point', cat: 'money', ja: ['あなただけに1000ポイント', ['あなただけに', '抽選で1名です']], en: ['1,000 points just for you', ['Just for you', 'One winner by lottery']] },
    sns: { k: 'r_sns', app: 'album', cat: 'sns', ja: ['あなたの写真がまた投稿されました', ['また投稿された写真', 'また指でした']], en: ['Another photo of you was posted', ['The photo', 'Your finger again']] },
    trap: { k: 'r_trap', app: 'set', cat: 'trap', sys: true, ja: ['このお知らせは罠ではありません', ['罠ではありません', 'でした']], en: ['This is not a trap', ['Not a trap', 'It was']] },
    call: { k: 'r_call', app: 'phone', cat: 'call', ja: ['不在着信 1件', ['不在着信', 'ドーパミンからでした']], en: ['1 missed call', ['Missed call', 'It was Dopamine']] },
    fake: { k: 'r_fake', app: 'set', cat: 'fake', sys: true, ja: ['診断が終わりました', ['診断', 'それも通知でした']], en: ['Your test is complete', ['The test', 'That was a notification too']] },
    phone: { k: 'r_phone', app: 'talk', cat: 'phone', from: { ja: 'あなたのスマホ', en: 'Your Phone' }, ja: ['前もここで押したよね', ['あなたのスマホ', '覚えてるよ']], en: ['You tapped here last time', ['Your Phone', 'I remember']] },
    app: { k: 'r_app', app: 'news', cat: 'app', ja: ['前回の続きから読めます', ['前回の続き', '続きはありません']], en: ['Pick up where you left off', ['Where you left off', 'There is nothing after']] },
  }
  // 罠と仕掛け。押した時の中身
  const TRAP = {
    hima: { cat: 'phone', app: 'weather', ja: ['暇なんですね', '明日も暇でしょう'], en: ['So you ARE bored', 'Bored again tomorrow too'] },
    off: { cat: 'trap', app: 'set', ja: ['通知をオフにしました', 'というお知らせが届きました'], en: ['Notifications turned off', 'We sent you a notification about it'] },
    later: { cat: 'trap', app: 'set', ja: ['あとで', 'が今になりました'], en: ['Later', 'Later is now'] },
    adclose: { cat: 'trap', app: 'web', ja: ['広告を閉じました', 'という広告です'], en: ['Ad closed', 'This is an ad for that'] },
    ad: { cat: 'trap', app: 'web', ja: ['広告を開きました', 'まばたきで痩せるメガネ'], en: ['You opened the ad', 'Glasses that slim you as you blink'] },
    endbtn: { cat: 'fake', app: 'set', ja: ['終了しました', 'あなたの記録が'], en: ['Ended', 'Your record, that is'] },
    callyes: { cat: 'call', app: 'phone', ja: ['もしもし', 'ドーパミンです'], en: ['Hello?', 'This is Dopamine'] },
    callno: { cat: 'call', app: 'phone', ja: ['拒否しました', '指で'], en: ['Declined', 'With your finger'] },
    dim: { cat: 'trap', app: 'set', ja: ['明るくなりました', '記録は暗くなりました'], en: ['Brightness restored', 'Your record is dimmed'] },
    upnow: { cat: 'sys', app: 'set', ja: ['再起動します', 'しません'], en: ['Restarting', 'Not really'] },
    upnight: { cat: 'sys', app: 'set', ja: ['今夜にしました', 'もう今夜です'], en: ['Scheduled for tonight', 'It is tonight already'] },
    slot: { cat: 'trap', app: 'set', ja: ['ここ', 'でした'], en: ['Here', 'Yep, here'] },
    fake: { cat: 'fake', app: 'set', ja: ['診断終了', 'と見せかけた通知でした'], en: ['Test complete', '...was just another notification'] },
    badge: { cat: 'app', app: 'set', ja: ['赤い丸', 'に負けました'], en: ['A red dot', 'beat you'] },
    clock: { cat: 'app', app: 'cal', ja: ['いまの時刻', '確かめたくなりましたね'], en: ['The time', 'You just had to check'] },
    sbar: { cat: 'empty', app: 'set', ja: ['上から', '何も出てきません'], en: ['From the top', 'Nothing comes down'] },
    empty: { cat: 'empty', app: 'set', ja: ['何もない所', 'を押しました'], en: ['Nothing there', 'You tapped it anyway'] },
    black: { cat: 'empty', app: 'set', ja: ['電源は', '入りません'], en: ['The power', 'won\'t come back'] },
    icon: { cat: 'app', ja: ['未読', '{c}件'], en: ['Unread', '{c}'] },
  }
  const CATS = {
    chat: { ja: '家族と友だち', en: 'family and friends' }, crush: { ja: '好きな人', en: 'your crush' }, oshi: { ja: '推し', en: 'your fave' },
    sys: { ja: 'スマホの警告', en: 'phone warnings' }, money: { ja: 'お金とポイント', en: 'money and points' }, sns: { ja: '自分のうわさ', en: 'gossip about you' },
    trap: { ja: 'ボタン', en: 'buttons' }, call: { ja: '電話', en: 'calls' }, fake: { ja: '終わったふり', en: 'fake endings' }, app: { ja: 'アプリ', en: 'apps' },
    phone: { ja: 'スマホ本人', en: 'the phone itself' }, empty: { ja: '何もない所', en: 'nothing at all' },
  }
  const NAMES = { ja: ['ゆい', 'はると', 'さき', 'れん', 'みお', 'そうた', 'あかり', 'ゆうと'], en: ['Yui', 'Haruto', 'Saki', 'Ren', 'Mio', 'Sota', 'Akari', 'Yuto'] }
  const OSHI = { ja: ['ひなたモカ', '月城レイ', 'りんごあめ子', 'KAI-TO', '大森ぽんず'], en: ['Hinata Moka', 'Rei Tsukishiro', 'Ringo Ameko', 'KAI-TO', 'Ponzu Omori'] }
  // 秒数の称号（統計は出さない）
  const TIERS = [
    { s: 0, ja: '反射で生きてる', en: 'Lives on Reflex', jc: '考えるより先に指が動いています', ec: 'Your finger moves before your brain does' },
    { s: 3, ja: '通知の申し子', en: 'Child of Notifications', jc: '通知音とあなたの指はほぼ同時でした', ec: 'The chime and your finger arrived together' },
    { s: 10, ja: '秒で開く人', en: 'Opens in Seconds', jc: '赤い丸を見ると押したくなる体質です', ec: 'Red dots make you want to press them' },
    { s: 30, ja: 'つい見ちゃう人', en: 'Just One Peek', jc: '「ちょっとだけ」が口ぐせのはずです', ec: '"Just a quick look" is your motto' },
    { s: 60, ja: 'まあまあ耐える人', en: 'Holds Out a Bit', jc: '人並みに耐えて人並みに負けました', ec: 'You held out like most people and lost like most people' },
    { s: 100, ja: '既読スルー初段', en: 'Left-on-Read Black Belt', jc: '未読をためられる立派な素質があります', ec: 'You have a real talent for unread piles' },
    { s: 150, ja: '通知に動じない人', en: 'Unmoved by Pings', jc: 'スマホの方が先にさみしがっていました', ec: 'Your phone got lonely before you did' },
    { s: 220, ja: 'ほぼ仏', en: 'Nearly a Buddha', jc: 'あと少しで通知の届かない世界でした', ec: 'You almost reached a world without notifications' },
    { s: 300, ja: '悟りの境地', en: 'Enlightened', jc: 'スマホの電池が先に力尽きました', ec: 'Your phone\'s battery gave up first' },
  ]
  const WAIT = [[0, 'しばらくお待ちください', 'Please wait'], [70, 'もうしばらくお待ちください', 'Please wait a little longer'], [150, 'まだお待ちください', 'Please keep waiting'], [190, 'お待たせしております', 'Thank you for waiting'], [230, 'もう少しです', 'Almost there'], [282, 'もう本当に少しです', 'Really almost there']]

  const UI = {
    ja: {
      title: 'ドーパミン中毒診断', form: '問診票', start: '診断を始める', how: '遊び方',
      fName: 'お名前', vName: 'あなた', fBest: '前回の記録', vNone: 'はじめて', fTime: '所要時間', vTime: '最長 5分',
      q1: '通知が来るとすぐ見る', q2: '赤い丸が気になる', q3: '5分のつもりが1時間になる', q4: '通知が来ないと不安になる',
      howH: '遊び方', how1: '始めるとスマホの画面になります', how2: '診断が終わるまでしばらくお待ちください', how3: '結果は秒数と称号で出ます', close: '閉じる',
      credit: '通知音の一部 Gravity Sound（CC BY 4.0）', privacy: 'プライバシー',
      load: '準備しています', now: '今', weatherWhere: 'となり町', sunny: '晴れ', hima: '暇ですか？',
      offH: '通知が多すぎます', offB: '通知をオフにしますか？', offY: '通知をオフにする', offN: 'あとで',
      adH: 'まばたきで痩せるメガネ', adS: '今だけ 9,800円', adClose: '広告を閉じる', adCount: s => `${s}秒後に閉じられます`,
      endBtn: '診断を終了する', callWho: '非通知', callSub: '着信', callYes: '応答', callNo: '拒否',
      dimMsg: '画面を暗くします', dimHint: '画面に触れると明るくなります',
      upH: '再起動が必要です', upB: 'アップデートを完了します', upY: '今すぐ', upN: '今夜',
      slot: 'ここ', clockNote: '止まっていません', notYet: 'まだです', battOut: '充電してください',
      repH: 'ドーパミン検査 結果', lasted: '耐えた時間', sec: '秒', judge: '判定', got: 'あなたのドーパミンを一番動かしたもの', none: 'なし',
      noneSub: 'スマホの電池が先に切れました', awayH: '本物のスマホ', awaySub: 'このページを離れました',
      fine: '検査は画面に触れた時点で終了します', ignored: n => `無視した通知 ${n}件`, found: (a, b) => `見つけた負け方 ${a}/${b}`,
      weak: c => `次回は「${c}」の通知が増えます`, best: '自己ベスト',
      again: 'もう一度', save: '画像を保存', post: 'Xでポスト',
      share: (s, tier, got) => `ドーパミン中毒診断 ${s}秒「${tier}」 負けた相手：${got}`,
      fakeTier: 'ほぼ仏', fakeGot: 'なし',
    },
    en: {
      title: 'Dopamine Addiction Test', form: 'INTAKE FORM', start: 'Start the test', how: 'How to play',
      fName: 'Name', vName: 'You', fBest: 'Last record', vNone: 'First time', fTime: 'Duration', vTime: 'Up to 5 min',
      q1: 'I check notifications right away', q2: 'Red dots bother me', q3: '5 minutes turns into an hour', q4: 'No notifications makes me nervous',
      howH: 'How to play', how1: 'The screen turns into a phone', how2: 'Please wait until the test is over', how3: 'Your result is a time and a title', close: 'Close',
      credit: 'Some notification sounds by Gravity Sound (CC BY 4.0)', privacy: 'Privacy',
      load: 'Getting ready', now: 'now', weatherWhere: 'Next Town', sunny: 'Sunny', hima: 'Bored?',
      offH: 'Too many notifications', offB: 'Turn notifications off?', offY: 'Turn off notifications', offN: 'Later',
      adH: 'Glasses That Slim You as You Blink', adS: 'Today only 9,800 yen', adClose: 'Close ad', adCount: s => `You can close in ${s}s`,
      endBtn: 'End the test', callWho: 'Unknown', callSub: 'incoming call', callYes: 'Answer', callNo: 'Decline',
      dimMsg: 'Dimming the screen', dimHint: 'Touch the screen to brighten it',
      upH: 'Restart required', upB: 'To finish the update', upY: 'Now', upN: 'Tonight',
      slot: 'here', clockNote: 'Not stopped', notYet: 'Not yet', battOut: 'Please charge',
      repH: 'DOPAMINE TEST REPORT', lasted: 'You lasted', sec: 's', judge: 'Result', got: 'What moved your dopamine most', none: 'Nothing',
      noneSub: 'Your phone\'s battery died first', awayH: 'Your real phone', awaySub: 'You left this page',
      fine: 'The test ends the moment you touch the screen', ignored: n => `Notifications ignored: ${n}`, found: (a, b) => `Ways to lose found: ${a}/${b}`,
      weak: c => `Next time: more notifications about ${c}`, best: 'Best',
      again: 'Try again', save: 'Save image', post: 'Post on X',
      share: (s, tier, got) => `Dopamine Addiction Test: ${s}s "${tier}". Got me: ${got}`,
      fakeTier: 'Nearly a Buddha', fakeGot: 'Nothing',
    },
  }
  return { APPS, GRID, DOCK, N, FIXED, AGAIN, TRAP, CATS, NAMES, OSHI, TIERS, WAIT, UI }
})()
