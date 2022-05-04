//GASのAPIのURL
const endpointShops = "https://script.google.com/macros/s/AKfycbwWa4vo8WI8Ji7pnpPvguJkyshpPQ4bYt2QDIQqH9Ni8o4r8sfFLXAwCHv3FSNXZjEpww/exec";
const endpointReviews = "https://script.google.com/macros/s/AKfycbyktHablfSrUPFfgGYWzYI1w3YOR8XFp7P06ZumbMmXx4rbjDFQ2vvcBc_lr3d2QlXAXg/exec";
const endpointAnnounce = "https://script.google.com/macros/s/AKfycbwmEMIL38TrTTdRMzjSEpxQW_nT64C9y9oxmNvfndX2HC0X0X7dBM2P4B-8Y_tg7iWv/exec";


let shopArray = []
let reviewArray = []
let sumReviewArray = []

let word = []
let id4form = 0

function shops(){ //　メインページでの要素配置
    fetch(endpointReviews) // レビュー取得
    .then(response => response.json())
    .then(data => {
        //JSONから配列に変換
        let getReviewArray = data;

        for(let i = 0; i < getReviewArray.length; i++){ // 変数の操作
            getReviewArray[i].写真 = (getReviewArray[i].写真).split(",");
            for(let j = 0; j < (getReviewArray[i].写真).length; j++){
                (getReviewArray[i].写真)[j] = (getReviewArray[i].写真)[j].substring((getReviewArray[i].写真)[j].indexOf("id=") + 3) // IDの抜き出し
                if((getReviewArray[i].写真)[j] != ""){ // 画像への直リンクに書き換え
                    (getReviewArray[i].写真)[j] = 'https://drive.google.com/uc?export=view&id=' + (getReviewArray[i].写真)[j]
                }
            }
        }

        for (let i in getReviewArray) {
            reviewArray[i] = getReviewArray[i];
        }

        for(let i = 0; i < getReviewArray.length; i++){ // 店ごとの合計レビュー保存
            let array = [getReviewArray[i].評価]; // 一個目のレビュー

            for(let j = i + 1; j < getReviewArray.length; j++){
                if(getReviewArray[i].店名.toUpperCase() === getReviewArray[j].店名.toUpperCase()){ // 店名が完全一致したら追加
                    array.push(getReviewArray[j].評価);

                    getReviewArray.splice(j, 1); // 追加したら削除
                    j--;
                }
            }

            let sum = 0;
            array = array.map(Number); // 文字列から数字に
            for (let k=0; k < array.length; k++) { // レビュー合計取得
                sum += array[k];
            }

            sumReviewArray.push({店名: getReviewArray[i].店名, 評価: Math.round(sum/array.length * 10) / 10}); // 店名とレビュー平均をまとめて追加
        }

        fetch(endpointShops)
        .then(response => response.json())
        /*成功した処理*/
        .then(data => {
            //JSONから配列に変換
            let getShopArray = data;

            for(let i = 0; i < getShopArray.length; i++){ // 変数の操作
                getShopArray[i].タイムスタンプ = getShopArray[i].タイムスタンプ.substr(0, 10); // 年月日の抜き出し
                getShopArray[i].写真 = getShopArray[i].写真.split(",");
                for(let j = 0; j < (getShopArray[i].写真).length; j++){
                    (getShopArray[i].写真)[j] = (getShopArray[i].写真)[j].substring((getShopArray[i].写真)[j].indexOf("id=") + 3) // IDの抜き出し
                    if((getShopArray[i].写真)[j] != ""){ // 画像への直リンクに書き換え
                        (getShopArray[i].写真)[j] = 'https://drive.google.com/uc?export=view&id=' + (getShopArray[i].写真)[j]
                    }
                    else{
                        (getShopArray[i].写真)[j] = 'https://haniwa828.github.io/JapanGourmetDB/photo/noImage.png'
                    }
                }

                // 定休日と営業日の入れ替え
                let dayArray = ['月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜', '無し']
                getShopArray[i].定休日 = getShopArray[i].定休日.split(', ')
                getShopArray[i].定休日 = getArrayDiff(getShopArray[i].定休日, dayArray);
                if(getShopArray[i].定休日[getShopArray[i].定休日.length - 1] == '無し'){
                    getShopArray[i].定休日.pop();
                }

                getShopArray[i].レビュー = 0;
                for(let j = 0; j < sumReviewArray.length; j++){ // レビューがあるか確認
                    if(getShopArray[i].店名.toUpperCase() === sumReviewArray[j].店名.toUpperCase()){
                        getShopArray[i].レビュー = sumReviewArray[j].評価;

                        break;
                    }
                }
            }

            getShopArray.sort(function(a, b) {
                var nameA = a.タイムスタンプ.toString().toUpperCase(); // 大文字と小文字を無視する
                var nameB = b.タイムスタンプ.toString().toUpperCase(); // 大文字と小文字を無視する
                if (nameA < nameB) {
                  return -1;
                }
                if (nameA > nameB) {
                  return 1;
                }

                // names must be equal
                return 0;
            });

            for (let i in getShopArray) {
                shopArray[i] = getShopArray[i];
            }

            shopComponent(getShopArray)
        });
    });

    fetch(endpointAnnounce) //
    .then(response => response.json())
    .then(data => {
        //JSONから配列に変換
        let getAnnounce = data;

        for(let i = getAnnounce.length - 1; i > getAnnounce.length - 4; i--){
            getAnnounce[i].タイムスタンプ = new Date(getAnnounce[i].タイムスタンプ);
            getAnnounce[i].タイムスタンプ = getAnnounce[i].タイムスタンプ.toISOString().substr(0, 10);
            $('#announceArea').append(' \
            <div style="border: 1px solid; border-color: #dcdcdc;"><a href="https://haniwa828.github.io/JapanGourmetDB/html/announce.html?announceId='+ i +'" style="display: flex;"><span style="word-break: break-all;">《'+ getAnnounce[i].カテゴリー +'》'+ getAnnounce[i].タイトル +'</span><span style="minwidth: 10px">&ensp;</span><span style="font-size: small; margin-left: auto; min-width: 70px">'+ getAnnounce[i].タイムスタンプ +'</span></a></div> \
            ')
        }

        $('#announceArea').append(' \
        <div style="border: 1px solid; border-color: #dcdcdc; text-align: right;"><a href="https://haniwa828.github.io/JapanGourmetDB/html/announce.html?announceId=-1">»全てのお知らせ</a></div> \
        ')
    });
}

function getArrayDiff(arr1, arr2) {
    let arr = arr1.concat(arr2);
    return arr.filter((v, i)=> {
      return !(arr1.indexOf(v) !== -1 && arr2.indexOf(v) !== -1);
    });
  }

function shopPress(id){ // ページ遷移時にurlにidをつける
    let tempoReviewArray = []
    let idNum = Number(id.replace('shop', ''));

    for (let i in reviewArray) {
        tempoReviewArray[i] = reviewArray[i];
    }

    for(let i = 0; i < tempoReviewArray.length; i++){
        if(shopArray[idNum].店名 === tempoReviewArray[i].店名){
            tempoReviewArray[i].タイムスタンプ = new Date(tempoReviewArray[i].タイムスタンプ);
            tempoReviewArray[i].タイムスタンプ = tempoReviewArray[i].タイムスタンプ.toISOString().substr(0, 10);
        }
        else{
            tempoReviewArray.splice(i, 1);
            i--;
        }
    }

    if(document.getElementById('container' + idNum).textContent == []){
        detailComponent(idNum, tempoReviewArray, sumReviewArray, shopArray);
    }
    else{
        detailOpen(idNum);
    }
}

function detailOpen(idNum){
    if(document.getElementById('container' + idNum).style.display != 'none'){
        document.getElementById('container' + idNum).style.display = 'none'
    }
    else{
        document.getElementById('container' + idNum).style.display = 'block'
    }
}

function search(){ // 検索窓関連
    let words = document.getElementById('search').value; // 入力文字列の取得
    words = words.replace(/　/g, " "); // 全角スペースを半角に
    word = words.split(' '); // 半角スペースごとにリストに分割して挿入
    let oriArray = shopArray.slice(); // shopArray保持のためのコピー

    for(let i = 0; i < oriArray.length; i++){ // 一旦全ての要素ブロックを表示
        let target = document.getElementById('shop' + i);
        target.style.display = 'flex'
    }

    applyPress();
}

function applyPress(){
    let oriArray = []
    for (let i in shopArray) {
        oriArray[i] = shopArray[i];
    }

    let selectedCategory = [];
    let selectedOperate = [];
    let selectedCost = [];
    let selectedAtmosphere = [];
    let selectedArea = [];
    let selectedAlcohol = [];
    let selectedSort = '';

    let categoryCategory = document.getElementsByName("category");
    let categoryOperate = document.getElementsByName("operateDay");
    let categoryCost = document.getElementsByName("cost");
    let categoryAtmosphere = document.getElementsByName("atmosphere");
    let categoryArea = document.getElementsByName("area");
    let categoryAlcohol = document.getElementsByName("alcohol");
    let categorySort = document.getElementsByName("sort");

    checkCheck(selectedCategory, categoryCategory);
    checkCheck(selectedOperate, categoryOperate);
    checkCheck(selectedCost, categoryCost);
    checkCheck(selectedAtmosphere, categoryAtmosphere);
    checkCheck(selectedArea, categoryArea);
    checkCheck(selectedAlcohol, categoryAlcohol);
    for (let i = 0; i < categorySort.length; i++){
        if (categorySort.item(i).checked){
            selectedSort = categorySort.item(i).value;
        }
    }

    sort(selectedSort);

    for(let i = 0; i < oriArray.length; i++){ // 一旦全ての要素ブロックを非表示
        let target = document.getElementById('shop' + i);
        target.style.display = 'none'
    }

    for(let j = 0; j < selectedCategory.length; j++){ // それぞれのselectedで検索
        for(let k = 0; k < selectedOperate.length; k++){
            for(let l = 0; l < selectedCost.length; l++){
                for(let m = 0; m < selectedAtmosphere.length; m++){
                    for(let o = 0; o < selectedArea.length; o++){
                        for(let p = 0; p < selectedAlcohol.length; p++){
                            for(let i = 0; i < oriArray.length; i++){ // それぞれの要素に対して検索
                                if(
                                    (oriArray[i].定休日).indexOf(selectedOperate[k]) != -1 
                                    && (
                                        (oriArray[i].昼営業の金額目安).indexOf(selectedCost[l]) != -1 
                                        || (oriArray[i].夜営業の金額目安).indexOf(selectedCost[l]) != -1 
                                    )
                                    && (oriArray[i].形式).indexOf(selectedAtmosphere[m]) != -1 
                                    && (
                                        (oriArray[i].住所.toUpperCase()).indexOf(selectedArea[o]) != -1 
                                        || selectedArea[o] == "全地域"
                                        ) 
                                    && (oriArray[i].酒の提供).indexOf(selectedAlcohol[p]) != -1 
                                    && document.getElementById('shop' + i).style.display == 'none'){ // 一致する要素がある時ー!
                                    if(((oriArray[i].ジャンル).indexOf(selectedCategory[j]) != -1)){
                                        target = document.getElementById('shop' + i);
                                        target.style.display = 'block' // 要素ブロックを表示
                                    }
                                    else if(selectedCategory[j] == 'その他'){
                                        let tempoStr = oriArray[i].ジャンル.slice();

                                        tempoStr = tempoStr.replace('和食', '');
                                        tempoStr = tempoStr.replace('喫茶', '');
                                        tempoStr = tempoStr.replace('洋食', '');
                                        tempoStr = tempoStr.replace('イタリアン', '');
                                        tempoStr = tempoStr.replace('デザート', '');
                                        tempoStr = tempoStr.replace('喫茶', '');
                                        tempoStr = tempoStr.replace('ラーメン', '');
                                        tempoStr = tempoStr.replace(/, /g, '');

                                        if(tempoStr != ''){
                                            target = document.getElementById('shop' + i);
                                            target.style.display = 'block' // 要素ブロックを表示
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    check(oriArray, word);
}

function filterOpen(){
    let element = document.getElementById('filter');

    if(element.style.display == 'block'){
        element.style.display = 'none';
    }
    else{
        element.style.display = 'block';
    }
}

function sort(rule){
    if(rule == '最終更新日'){
        shopArray.sort(function(a, b) {
            var nameA = a.タイムスタンプ.toString().toUpperCase(); // 大文字と小文字を無視する
            var nameB = b.タイムスタンプ.toString().toUpperCase(); // 大文字と小文字を無視する
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // names must be equal
            return 0;
        });
    }
    else if(rule == '店名(a-z)'){
        shopArray.sort(function(a, b) {
            var nameA = a.店名.toString().toUpperCase(); // 大文字と小文字を無視する
            var nameB = b.店名.toString().toUpperCase(); // 大文字と小文字を無視する
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }

            // names must be equal
            return 0;
        });
    }
    else if(rule == '店名(z-a)'){
        shopArray.sort(function(a, b) {
            var nameA = a.店名.toString().toUpperCase(); // 大文字と小文字を無視する
            var nameB = b.店名.toString().toUpperCase(); // 大文字と小文字を無視する
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // names must be equal
            return 0;
        });
    }
    else{
        shopArray.sort(function(a, b) {
            var nameA = a.レビュー.toString().toUpperCase(); // 大文字と小文字を無視する
            var nameB = b.レビュー.toString().toUpperCase(); // 大文字と小文字を無視する
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }

            // names must be equal
            return 0;
        });
    }

    shopComponent(shopArray);
}



function shopComponent(array){ // 店ブロック挿入用関数
    $('.shops').remove(); // 店の要素全削除

    let tempoArray = JSON.parse(JSON.stringify(array));

    for(let i = 0; i < tempoArray.length; i++){
        tempoArray[i].ジャンル = tempoArray[i].ジャンル.replace('和食', 'https://haniwa828.github.io/JapanGourmetDB/photo/japan.png')
        tempoArray[i].ジャンル = tempoArray[i].ジャンル.replace('中華', 'https://haniwa828.github.io/JapanGourmetDB/photo/china.png')
        tempoArray[i].ジャンル = tempoArray[i].ジャンル.replace('イタリアン', 'https://haniwa828.github.io/JapanGourmetDB/photo/italy.png')
        tempoArray[i].ジャンル = tempoArray[i].ジャンル.replace('喫茶', 'https://haniwa828.github.io/JapanGourmetDB/photo/cafe.png')
        tempoArray[i].ジャンル = tempoArray[i].ジャンル.replace('デザート', 'https://haniwa828.github.io/JapanGourmetDB/photo/cake.png')
        tempoArray[i].ジャンル = tempoArray[i].ジャンル.replace('ラーメン', 'https://haniwa828.github.io/JapanGourmetDB/photo/ramen.png')

        tempoArray[i].ジャンル = tempoArray[i].ジャンル.split(",");
    }

    let width = document.body.clientWidth - 17
    // let height = document.documentElement.clientHeight

    if(array.length == 0){ // 表示する要素が無いとき......
        $('#shop').append('<div class="shops">まだ有効な店が登録されていません</div>');
    }
    else{ // ある時ー!
        for(let i = array.length - 1; i >= 0; i--){ // 店ブロック挿入
            let review = 0;

            review = array[i].レビュー;
            review = review - review%0.5;

            $('#shop').append(' \
            <div id="shop' + i + '" class="shops" style="display: block; background-color: #fffafa; text-align: left; border: 1px solid; border-color: #dcdcdc; border-radius: 5px; width: '+ width +'; margin: 5px 0px 5px 0px; padding: 10px; position: relative;" onclick="shopPress(id)"> \
                <div style="display: flex; flex-wrap: wrap;"> \
                    <div> \
                        <div id="genre'+ i +'" style="font-size: small; color: gray;"> \
                        </div> \
                        <img style="width: '+ width/3 +'px; height: '+ width/4 +'px; object-fit: cover;" src="'+ (array[i].写真)[0] +'"> \
                    </div> \
                    <div>&ensp;&ensp;</div> \
                    <div style="width: '+ (2*width/3 - 70) +'px;"> \
                        <div style="font-size: small; color: gray;"> \
                            '+ array[i].形式+' \
                        </div> \
                        <div style="font-size: x-large; font-weight: bold; word-break: break-all;"> \
                            '+ array[i].店名 +' \
                        </div> \
                        <div style="color: dimgray;"> \
                            <span class="star5_rating" data-rate="'+ review +'"></span> \
                            '+ array[i].レビュー +' \
                        </div> \
                        <div style="font-size: small; color: gray; text-align: right; word-wrap: break-word; display: flex; margin: 0% 0% 0% 0%;"> \
                            最終更新日：'+ array[i].タイムスタンプ +' \
                        </div> \
                    </div> \
                </div> \
                <div id="container'+ i +'" style="block" onclick="detailOpen('+ i +')"></div> \
            </div> \
            ');

            for(let j = 0; j < tempoArray[i].ジャンル.length; j++){
                if(tempoArray[i].ジャンル[j].indexOf('/photo/') != -1){
                    $('#genre' + i).append(' \
                        <img style="width: '+ width/12 +'px; height: '+ width/12 +'px; object-fit: cover;" src="'+ tempoArray[i].ジャンル[j] +'"></img> \
                    ');
                }
                else{
                    $('#genre' + i).append(' \
                        <span>'+ tempoArray[i].ジャンル[j] +'</span> \
                    ');
                }
            }
        }
    }
}

function check(originalArray, word){ // 一致する要素の検索
    for(let j = 0; j < word.length; j++){ // それぞれのwordで検索
        for(let i = 0; i < originalArray.length; i++){ // それぞれの要素に対して検索
            if(
                (
                    (originalArray[i].ジャンル).indexOf(word[j]) != -1 
                    || (originalArray[i].店名.toUpperCase()).indexOf(word[j].toUpperCase()) != -1 
                    // || (originalArray[i].形式).indexOf(word[j]) != -1 
                    || (originalArray[i].説明.toUpperCase()).indexOf(word[j].toUpperCase()) != -1 
                    || (originalArray[i].住所.toUpperCase()).indexOf(word[j].toUpperCase()) != -1 
                ) 
                && document.getElementById('shop' + i).style.display == 'block'
                ){ // 一致する要素がある時ー!
                target = document.getElementById('shop' + i);
                target.style.display = 'block' // 要素ブロックを表示
            }
            else{ // 無いとき......
                target = document.getElementById('shop' + i);
                target.style.display = 'none' // 要素ブロックを非表示
            }
        }
    }
}

function searchShop(id){
    let words = document.getElementById(id).value; // 入力文字列の取得
    words = words.replace(/　/g, " "); // 全角スペースを半角に
    let searchKey = words.split(' '); // 半角スペースごとにリストに分割して挿入
    let shopNames = [];

    for(let i = 0; i < shopArray.length; i++){ // 一旦全ての要素ブロックを表示
        let target = document.getElementById('shopName' + i);
        shopNames.push(target.textContent)
        target.style.display = 'block'
    }

    for(let j = 0; j < searchKey.length; j++){ // それぞれのsearchKeyで検索
        for(let i = 0; i < shopNames.length; i++){ // それぞれの要素に対して検索
            if(shopNames[i].toUpperCase().indexOf(searchKey[j].toUpperCase()) != -1 && document.getElementById('shop' + i).style.display == 'block'){ // 一致する要素がある時ー!
                target = document.getElementById('shopName' + i);
                target.style.display = 'block' // 要素ブロックを表示
            }
            else{ // 無いとき......
                target = document.getElementById('shopName' + i);
                target.style.display = 'none' // 要素ブロックを非表示
            }
        }
    }
    
    let block = 0;
    for(let i = 0; i < shopNames.length; i++){ // それぞれの要素に対して検索
        if(document.getElementById('shopName' + i).style.display == 'block'){ // 一致する要素がある時ー!
            block++;

            console.log(i)
            break;
        }
    }

    if(block == 0){
        document.getElementById('noMatch').style.display = 'block';
    }
    else{
        document.getElementById('noMatch').style.display = 'none';
    }
}


function checkCheck(selected, category){
    for (let i = 0; i < category.length; i++) {
        if (category[i].checked) { //(category[i].checked === true)と同じ
          selected.push(category[i].value);
        }
    }
}


function detailComponent(id, rArray, rsArray, sArray){
    let review = 0;
    let width = document.body.clientWidth - 17

    for(let j = 0; j < rsArray.length; j++){ // レビューがあるか確認
        if(sArray[id].店名 === rsArray[j].店名){
            review = rsArray[j].評価;
        }
    }

    reviewStr = review.toString(); // 評価を文字列に
    review = review - review%0.5;

    let shopid = sArray[id].店名.replace('&', 'aannddkkaarrii')

    $('#container' + id).append(' \
        <div style="margin: 10px 0px 10px 0px;"> \
            <img id="mainImage'+ id +'" style="width: '+ width/1.5 +'px; height: '+ width/2 +'px; object-fit: contain;" src="'+ (sArray[id].写真)[0] +'"> \
        </div> \
        <div id="images'+ id +'" style="display: flex; overflow-x: auto; margin: 10px 0px 10px 0px;"> \
        </div> \
        <div id="address" style="word-break: break-all;"> \
            営業日：'+ sArray[id].定休日 +' \
        </div> \
        <div id="address" style="word-break: break-all;"> \
            金額目安(昼)：'+ sArray[id].昼営業の金額目安 +' \
        </div> \
        <div id="address" style="word-break: break-all;"> \
            金額目安(夜)：'+ sArray[id].夜営業の金額目安 +' \
        </div> \
        <br> \
        <div id="address" style="word-break: break-all;"> \
            住所：'+ sArray[id].住所 +' \
        </div> \
        <div style="word-break: break-all;"> \
            ホームページ： \
            <a id="page" href="'+ sArray[id].ホームページリンク +'" target="_blank"> \
                '+ sArray[id].ホームページリンク +' \
            </a> \
        </div> \
        <div style="word-break: break-all;"> \
            SNS： \
            <a id="page" href="'+ sArray[id].SNSリンク +'" target="_blank"> \
                '+ sArray[id].SNSリンク +' \
            </a> \
        </div> \
        <div style="word-break: break-all;"> \
            電話番号：'+ sArray[id].電話番号 +' \
        </div> \
        <br> \
        <div style="font-size: small; color: gray;"> \
            酒：'+ sArray[id].酒の提供+' \
        </div> \
        <div id="explain" style="font-size: large;" style="word-break: break-all;"> \
            説明： \
            <br> \
            '+ sArray[id].説明.replace(/\r?\n/g, '<br>') +' \
        </div> \
        <br> \
        <a class="button" href="https://haniwa828.github.io/JapanGourmetDB/html/details.html?shopName='+ shopid +'" target="_blank">別ページで開く</a> \
        <br> \
        <br> \
        <div style="margin: 0px 0px 10px 0px;"> \
            レビュー： \
        </div> \
        <div id="review'+ id +'" style="display: flex; overflow-x: auto"> \
        </div> \
    </div> ');

    for(let i = 0; i < (sArray[id].写真).length; i++){
        $('#images' + id).append(' \
        <img id="photo'+ id +'" style="width: '+ width/3 +'px; height: '+ width/4 +'px; object-fit: contain;" src="'+ (sArray[id].写真)[i] +'" onclick="changePhoto(id, src)"> \
        ')
    }

    for(let i = rArray.length - 1; i >= 0; i--){
        let review = rArray[i].評価 - rArray[i].評価%0.5;

        $('#review' + id).append(' \
        <div class="reviews" style="background-color: #f8f8ff; text-align: left; border: 1px solid; border-color: #dcdcdc; border-radius: 5px; width: 200px; min-width: 200px; margin: 5px 10px 5px 0px; padding: 15px; position: relative;"> \
            <span style="font-size: x-large; font-weight: bold; word-wrap: break-word;"> \
                '+ rArray[i].タイトル +' \
            </span> \
            <br> \
            <div> \
                <span class="star5_rating" data-rate="'+ review +'"> \
                </span> \
                '+ rArray[i].評価 +' \
            </div> \
            <div> \
                '+ rArray[i].レビュー +' \
            </div> \
            <br> \
            <div id="reviewImage'+ i +'of'+ id +'" style="display: flex; overflow-x: auto"> \
            </div> \
            <div style="font-size: small; color: darkgray; text-align: right; word-wrap: break-word;"> \
                最終更新日：'+ rArray[i].タイムスタンプ +' \
            </div> \
        </div>');

        if((rArray[i].写真)[0] != ''){
            for(let j = 0; j < rArray[i].写真.length; j++){
                $('#reviewImage'+ i + 'of' + id).append(' \
                <img style="width: '+ width/3 +'px; height: '+ width/4 +'px; object-fit: contain; margin: 0px 10px 5px 0px;" src="'+ (rArray[i].写真)[j] +'"> \
                ')
            }
        }
    }
}

function changePhoto(id, src){
    let idNum = Number(id.replace('photo', ''));
    let element = document.getElementById('mainImage' + idNum);

    element.src = src;
    // shopPress('shop' + idNum)
}


$(function () {
    $('.js-open').click(function () {
        $("body").addClass("no_scroll"); // 背景固定させるクラス付与
        id4form = $(this).data('id'); // 何番目のキャプション（モーダルウィンドウ）か認識
        $('#overlay, .modal-window[data-id="modal' + id4form + '"]').fadeIn();

        // let idComponent = 'forReviewLink' + id;

        for(let i = shopArray.length - 1; i >= 0; i--){
            $('#forReviewLink' + id4form).append(' \
            <div id="shopName'+ i +'">'+ shopArray[i].店名 +'</div> \
            ')
        }
        
        $('#forReviewLink' + id4form).append(' \
            <div id="noMatch" style="display: none">一致する結果はありませんでした</div> \
        ')
    });
    // オーバーレイクリックでもモーダルを閉じるように
    $('.js-close , #overlay').click(function () {
        $("body").removeClass("no_scroll"); // 背景固定させるクラス削除
        $('#overlay, .modal-window').fadeOut();
        $('#forReviewLink' + id4form).empty()
    });
  });

