function shopsDetail(){ //　メインページでの要素配置
    let param = location.search
    param = getParam('shopName')
    
    param = param.replace('%20', ' ');
    param = param.replace('%3%80%80', '　');
    param = param.replace('aannddkkaarrii', '&');

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

            let id = -1
            for (let i in getShopArray) {
                shopArray[i] = getShopArray[i];

                if(param === getShopArray[i].店名){
                    id = i;
                }
            }

            shopDetailComponent(getShopArray, id)
        });
    });
}

function shopDetailComponent(array, id){
    $('.shops').remove(); // 店の要素全削除

    let tempoArray = JSON.parse(JSON.stringify(array));

    for(let i = 0; i < tempoArray.length; i++){
        tempoArray[i].ジャンル = tempoArray[i].ジャンル.replace('和食', 'https://haniwa828.github.io/JapanGourmetDB/photo/japan.png')
        tempoArray[i].ジャンル = tempoArray[i].ジャンル.replace('中華', 'https://haniwa828.github.io/JapanGourmetDB/photo/china.png')

        tempoArray[i].ジャンル = tempoArray[i].ジャンル.split(",");
    }

    let width = document.body.clientWidth - 17

    if(array.length == 0){ // 表示する要素が無いとき......
        $('#shop').append('<div class="shops">まだ有効な店が登録されていません</div>');
    }
    else{ // ある時ー!
        let review = 0;
    
        if(id != -1){
            review = array[id].レビュー;
        }
        
        review = review - review%0.5;


        $('#shop').append(' \
        <div id="shop' + id + '" class="shops" style="display: block; background-color: #fffafa; text-align: left; border: 1px solid; border-color: #dcdcdc; border-radius: 5px; width: '+ width +'; margin: 10px 10px 10px 10px; padding: 10px; position: relative;"> \
                <div id="genre'+ id +'" style="font-size: small; color: gray;"></div> \
                <div style="font-size: small; color: gray;"> \
                    '+ array[id].形式+' \
                </div> \
                <div style="font-size: x-large; font-weight: bold; word-break: break-all; color: black"> \
                    '+ array[id].店名 +' \
                </div> \
                <div style="color: dimgray;"> \
                    <span class="star5_rating" data-rate="'+ review +'"></span> \
                    '+ array[id].レビュー +' \
                </div> \
                <div style="font-size: small; color: gray; text-align: right; word-wrap: break-word; display: flex; margin: 0% 0% 0% 0%;"> \
                    最終更新日：'+ array[id].タイムスタンプ +' \
                </div> \
            <div id="container'+ id +'" style="block"> \
                <div style="margin: 10px 0px 10px 0px;"> \
                    <img id="mainImage'+ id +'" style="width: '+ width/1.5 +'px; height: '+ width/2 +'px; object-fit: contain;" src="'+ (array[id].写真)[0] +'"> \
                </div> \
                <div id="images'+ id +'" style="height: '+ width/3.5 +'px;display: flex; overflow-x: auto; margin: 10px 0px 10px 0px;"> \
                </div> \
                <div id="address" style="word-break: break-all;"> \
                    営業日：'+ array[id].定休日 +' \
                </div> \
                <div id="address" style="word-break: break-all;"> \
                    金額目安(昼)：'+ array[id].昼営業の金額目安 +' \
                </div> \
                <div id="address" style="word-break: break-all;"> \
                    金額目安(夜)：'+ array[id].夜営業の金額目安 +' \
                </div> \
                <br> \
                <div id="address" style="word-break: break-all;"> \
                    住所：'+ array[id].住所 +' \
                </div> \
                <div style="word-break: break-all;"> \
                    ホームページ： \
                    <a id="page" href="'+ array[id].ホームページリンク +'" target="_blank"> \
                        '+ array[id].ホームページリンク +' \
                    </a> \
                </div> \
                <div style="word-break: break-all;"> \
                    SNS： \
                    <a id="page" href="'+ array[id].SNSリンク +'" target="_blank"> \
                        '+ array[id].SNSリンク +' \
                    </a> \
                </div> \
                <div style="word-break: break-all;"> \
                    電話番号：'+ array[id].電話番号 +' \
                </div> \
                <br> \
                <div style="font-size: small; color: gray;"> \
                    酒：'+ array[id].酒の提供+' \
                </div> \
                <div id="explain" style="font-size: large;" style="word-break: break-all;"> \
                    説明： \
                    <br> \
                    '+ array[id].説明.replace(/\r?\n/g, '<br>') +' \
                </div> \
                <br> \
                <div style="margin: 0px 0px 10px 0px;"> \
                    レビュー： \
                </div> \
                <div id="review'+ id +'" style="display: flex; overflow-x: auto"> \
                </div> \
            </div> \
            </div> \
        </div> \
        ');

        for(let i = 0; i < (array[id].写真).length; i++){
            $('#images' + id).append(' \
            <img id="photo'+ id +'" style="width: '+ width/3 +'px; height: '+ width/4 +'px; object-fit: contain;" src="'+ (array[id].写真)[i] +'" onclick="changePhoto(id, src)"> \
            ')
        }

        for(let j = 0; j < tempoArray[id].ジャンル.length; j++){
            if(tempoArray[id].ジャンル[j].indexOf('/photo/') != -1){
                $('#genre' + id).append(' \
                    <img style="width: '+ width/12 +'px; height: '+ width/12 +'px; object-fit: cover;" src="'+ tempoArray[id].ジャンル[j] +'"></img> \
                ');
            }
            else{
                $('#genre' + id).append(' \
                    <span>'+ tempoArray[id].ジャンル[j] +'</span> \
                ');
            }
        }

        for(let i = 0; i < reviewArray.length; i++){
            if(shopArray[id].店名 === reviewArray[i].店名){
                reviewArray[i].タイムスタンプ = new Date(reviewArray[i].タイムスタンプ);
                reviewArray[i].タイムスタンプ = reviewArray[i].タイムスタンプ.toISOString().substr(0, 10);
            }
            else{
                reviewArray.splice(i, 1);
                i--;
            }
        }

        for(let i = reviewArray.length - 1; i >= 0; i--){
            let review = reviewArray[i].評価 - reviewArray[i].評価%0.5;
    
            $('#review' + id).append(' \
            <div class="reviews" style="background-color: #f8f8ff; text-align: left; border: 1px solid; border-color: #dcdcdc; border-radius: 5px; width: 200px; min-width: 200px; margin: 5px 10px 5px 0px; padding: 15px; position: relative;"> \
                <span style="font-size: x-large; font-weight: bold; word-wrap: break-word;"> \
                    '+ reviewArray[i].タイトル +' \
                </span> \
                <br> \
                <div> \
                    <span class="star5_rating" data-rate="'+ review +'"> \
                    </span> \
                    '+ reviewArray[i].評価 +' \
                </div> \
                <div> \
                    '+ reviewArray[i].レビュー +' \
                </div> \
                <br> \
                <div id="reviewImage'+ i +'of'+ id +'" style="height: auto; display: flex; overflow-x: auto"> \
                </div> \
                <div style="font-size: small; color: darkgray; text-align: right; word-wrap: break-word;"> \
                    最終更新日：'+ reviewArray[i].タイムスタンプ +' \
                </div> \
            </div>');
    
            if((reviewArray[i].写真)[0] != ''){
                for(let j = 0; j < reviewArray[i].写真.length; j++){
                    $('#reviewImage'+ i + 'of' + id).append(' \
                    <img style="width: '+ width/3 +'px; height: '+ width/4 +'px; object-fit: contain; margin: 0px 10px 5px 0px;" src="'+ (reviewArray[i].写真)[j] +'"> \
                    ')
                }
            }
        }
    }
}