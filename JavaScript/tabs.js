function announce(){
  let param = location.search
  param = getParam('announceId')
  
  fetch(endpointAnnounce) // レビュー取得
    .then(response => response.json())
    .then(data => {
        //JSONから配列に変換
        let getAnnounce = data;

        for(let i = getAnnounce.length - 1; i >= 0; i--){
            getAnnounce[i].タイムスタンプ = new Date(getAnnounce[i].タイムスタンプ);
            getAnnounce[i].タイムスタンプ = getAnnounce[i].タイムスタンプ.toISOString().substr(0, 10);

        }
        
        if(param != -1){
          getAnnounce[param].本文　= getAnnounce[param].本文.replace(/\r?\n/g, '<br>');

          $('#announceDisplay').append(' \
          <div>'+ getAnnounce[param].タイムスタンプ +'</div> \
          <div style="font-size: large;">《'+ getAnnounce[param].カテゴリー +'》'+ getAnnounce[param].タイトル +'</div> \
          <br> \
          <div style="font-size: large;">'+ getAnnounce[param].本文 +'</div> \
          <br> \
          ')
        }
        else{
          for(let i = getAnnounce.length - 1; i >= 0; i--){
            getAnnounce[i].タイムスタンプ = new Date(getAnnounce[i].タイムスタンプ);
            getAnnounce[i].タイムスタンプ = getAnnounce[i].タイムスタンプ.toISOString().substr(0, 10);
            $('#announceDisplay').append(' \
            <div style="border: 1px solid; border-color: #dcdcdc;"><a href="announce.html?announceId='+ i +'" style="display: flex;"><span style="word-break: break-all;">《'+ getAnnounce[i].カテゴリー +'》'+ getAnnounce[i].タイトル +'</span><span style="minwidth: 10px">&ensp;</span><span style="font-size: small; margin-left: auto; min-width: 70px">'+ getAnnounce[i].タイムスタンプ +'</span></a></div> \
            ')
          }
        }
        

        for(let i = getAnnounce.length - 1; i > getAnnounce.length - 4; i--){
          getAnnounce[i].タイムスタンプ = new Date(getAnnounce[i].タイムスタンプ);
          getAnnounce[i].タイムスタンプ = getAnnounce[i].タイムスタンプ.toISOString().substr(0, 10);
          $('#announceArea').append(' \
          <div style="border: 1px solid; border-color: #dcdcdc;"><a href="announce.html?announceId='+ i +'" style="display: flex;"><span style="word-break: break-all;">《'+ getAnnounce[i].カテゴリー +'》'+ getAnnounce[i].タイトル +'</span><span style="minwidth: 10px">&ensp;</span><span style="font-size: small; margin-left: auto; min-width: 70px">'+ getAnnounce[i].タイムスタンプ +'</span></a></div> \
          ')
        }

        $('#announceArea').append(' \
        <div style="border: 1px solid; border-color: #dcdcdc; text-align: right;"><a href="announce.html?announceId=-1">»全てのお知らせ</a></div> \
        ')
    });
}

function getParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

