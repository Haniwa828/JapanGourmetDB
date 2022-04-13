// 主にshopDetail.html関連のjs
function GetQueryString(){ // ページurlの取得
    if(1 < document.location.search.length){
        var query = document.location.search.substring(1);
        var parameters = query.split('&');
        var result = new Object();

        for(let i = 0; i < parameters.length; i++){
            var element = parameters[i].split('=');
            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);
            
            result[paramName] = decodeURIComponent(paramValue);
        }

        return result;
    }

    return null
}

function getID(){ // id取得
    let idNum = 0
    let parameter = GetQueryString();
    if(parameter == null || parameter['id'] == undefined){
        let id = 'No ID';
    }
    else{
        let id = parameter['id'];
        idNum = Number(id.replace('shop', ''));
    };
    
    detail(idNum);
}

function detail(idNum){ // containerに要素追加(そのうち書き換える)
    getArray(idNum)
}














function getArray(id){ //　メインページでの要素配置
    let rArray = [];
    let rsArray = [];
    let sArray = [];

    fetch(endpointReviews) // レビュー取得
    .then(response => response.json())
    .then(data => {
        //JSONから配列に変換
        let getArray = data;
        
        for (let i in getArray) {
            rArray[i] = getArray[i];
        }
        // console.log(rArray)

        for(let i = 0; i < getArray.length; i++){ // 店ごとの合計レビュー保存
            let array = [getArray[i].評価]; // 一個目のレビュー

            for(let j = i + 1; j < getArray.length; j++){
                if(getArray[i].店名 === getArray[j].店名){ // 店名が完全一致したら追加
                    array.push(getArray[j].評価);

                    getArray.splice(j, 1); // 追加したら削除
                    j--;
                }
            }

            let sum = 0;
            array = array.map(Number); // 文字列から数字に
            for (let k=0; k < array.length; k++) { // レビュー合計取得
                sum += array[k];
            }

            rsArray.push({店名: getArray[i].店名, 評価: Math.round(sum/array.length * 10) / 10}); // 店名とレビュー平均をまとめて追加
        }

        fetch(endpointShops)
        .then(response => response.json())
        /*成功した処理*/
        .then(data => {
            //JSONから配列に変換
            let getArray = data;
            
            getArray[id].タイムスタンプ = getArray[id].タイムスタンプ.substr(0, 10); // 年月日の抜き出し
            getArray[id].写真 = getArray[id].写真.substring(getArray[id].写真.indexOf("id=") + 3, getArray[id].写真.indexOf(",")) // IDの抜き出し
            if(getArray[id].写真 != ""){ // 画像への直リンクに書き換え
                getArray[id].写真 = 'https://drive.google.com/uc?export=view&id=' + getArray[id].写真
            }
            if(getArray[id].ホームページリンク == ""){ // 画像への直リンクに書き換え
                getArray[id].ホームページリンク = 'No Data'
            }
            if(getArray[id].SNSリンク == ""){ // 画像への直リンクに書き換え
                getArray[id].SNSリンク = 'No Data'
            }
            if(getArray[id].住所 == ""){ // 画像への直リンクに書き換え
                getArray[id].住所 = 'No Data'
            }
            if(getArray[id].電話番号 == ""){ // 画像への直リンクに書き換え
                getArray[id].電話番号 = 'No Data'
            }

            for(let i = 0; i < rArray.length; i++){
                if(getArray[id].店名 === rArray[i].店名){
                    rArray[i].タイムスタンプ = new Date(rArray[i].タイムスタンプ);
                    rArray[i].タイムスタンプ = rArray[i].タイムスタンプ.toISOString().substr(0, 10);
                }
                else{
                    rArray.splice(i, 1);
                    i--;
                }
            }
            
            sArray.push(getArray[id]);

            console.log(rArray)
            console.log(rsArray)
            console.log(sArray)

            test(rArray, rsArray, sArray);
        });
    })
}

function test(rArray, rsArray, sArray){
    let review = 0;

    for(let j = 0; j < rsArray.length; j++){ // レビューがあるか確認
        if(sArray[0].店名 === rsArray[j].店名){
            review = rsArray[j].評価;
        }
    }

    reviewStr = review.toString(); // 評価を文字列に
    review = review - review%0.5;

    $('#container').append(' \
        <div style="background-color: #ffffff; text-align: left; border-radius: 5px; margin: 10px 10px 0px 10px; padding: 15px; position: relative; box-shadow: 4px 4px 4px lightgray;"> \
        <span style="font-size: small; color: gray;"> \
        '+ sArray[0].ジャンル +' \
        </span> \
        <br> \
        <span style="font-size: xx-large; font-weight: bold; word-wrap: break-word;"> \
        '+ sArray[0].店名 +' \
        </span> \
        <br> \
        <p> \
        <span class="star5_rating" data-rate="'+ review +'"></span> \
        '+ reviewStr +' \
        </p> \
         \
        <div> \
        <ul class="slider"> \
        </ul> \
        </div> \
        \
        <a id="address">住所：'+ sArray[0].住所 +'</a> \
        <br> \
        <a id="page">ホームページ：'+ sArray[0].ホームページリンク +'</a> \
        <br> \
        <a id="sns">SNS：'+ sArray[0].SNSリンク +'</a> \
        <br> \
        <br> \
        <div id="explain" style="font-size: large;">説明：<br>'+ sArray[0].説明 +'</div> \
        <br> \
        <div>レビュー：</div> \
        <div id="review" style="display: flex; margin: 0px 0px 30px 0px;"></div> \
    </div>');

    for(let i = 0; i < rArray.length; i++){
        let review = rArray[i].評価 - rArray[i].評価%0.5;

        $('#review').append(' \
            <div id="shop' + i + '" class="shops" style="background-color: #f8f8ff; text-align: left; border-radius: 5px; width: 300px; margin: 10px 10px 0px 10px; padding: 15px; position: relative; box-shadow: 4px 4px 4px lightgray;"> \
                <span style="font-size: xx-large; font-weight: bold; word-wrap: break-word;"> \
                '+ rArray[i].タイトル +' \
                </span> \
                <br> \
                <p> \
                <span class="star5_rating" data-rate="'+ review +'"></span> \
                '+ rArray[i].評価 +' \
                </p> \
                <div>'+ rArray[i].レビュー +'</div> \
                <div style="font-size: small; color: darkgray; text-align: right; word-wrap: break-word;"> \
                最終更新日：'+ rArray[i].タイムスタンプ +' \
                </div> \
            </div>');
    }
}

