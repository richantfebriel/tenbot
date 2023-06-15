var SheetID = "1aASs3CywugjUQdRNw7li_EVG3iPxvL4lS9jfDRtR3gk";
var token = "5829467956:AAGdxVvDwxxQln5QNfp0ycHUDXqQ1Qg1Kto";
var telegramUrl = "https://api.telegram.org/bot" + token;
var webAppUrl = "https://script.google.com/macros/s/AKfycbzZiV5WTW1Yg5aqUnnqJthbVBn3ABmRJBcrWkTfvJKL-J-nugetg1Lvt4b4Fv4Q_ATB/exec";

function setWebhook(){
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response  = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doPost(e) {    
  var stringJson = e.postData.getDataAsString();   
  var updates = JSON.parse(stringJson);

  if(updates.callback_query){ 
    //handling callback query dari inline keyboard 
  } else if(updates.message){ 
  if(updates.message.new_chat_participant){    
      //kirim pesan welcome ke updates.message.chat.id
      sendText(updates.message.from.id, "hai selamat datang, untuk memulai bot klik /start");
    } else if(updates.message.left_chat_participant){    
      //kirim pesan goodbye ke updates.message.chat.id
      sendText(updates.message.from.id, "selamat tinggal, have a nice day");    
    } else if(updates.message.text){  
        if(updates.message.text[0]=="/"){      
          //kirim pesan balasan command 
          periksaPerntah(updates); 
        } else {    
            periksaText(updates); 
          //balas pesan reguler 
        }        
    }
  }
}

function periksaPerntah(updates){
  var comand = updates.message.text.split(" ");
  var state = getUserState(updates.message.from.id);
 
  switch(comand[0].toLowerCase()){
 
    case "/start":
      saveUser(updates.message.from,comand[1]); 
      sendText(updates.message.chat.id,"Halo, Silahkan masukan data dengan : \n/input\n dan untuk melihat laporan dengan : \n/report");
      break;
    case "/input":
      saveUserState(updates.message.from.id,"NEWDATA");
      sendText(updates.message.chat.id,"Tanggal (dd/mm/yyyy) : ");
      break;
    case "/report":
      var sheet = SpreadsheetApp.openById(SheetID).getSheetByName("DATA");
      var satu = sheet.getDataRange().getCell(1, 14).getValue();
      var dua = sheet.getDataRange().getCell(2, 14).getValue();
      var tiga = sheet.getDataRange().getCell(3, 14).getValue();
      var empat = sheet.getDataRange().getCell(4, 14).getValue();
      var lima = sheet.getDataRange().getCell(5, 14).getValue();
      var enam = sheet.getDataRange().getCell(6, 14).getValue();
      sendText(updates.message.from.id, "Total CAM: " + satu + " \n " + "Total CAM Hadir: " + dua + " \n " + "Total Dealing: " + tiga + " \n " + "Target All: " + empat + " \n " + "Real Deal: " + lima + " \n " + "Pencapaian: " + enam*100 + "%" );
      break;
    case "/finish":
      if(state=="FINALIZE"){
        var userrow = getData(updates.message.from.id,0,"USER");
        saveData(updates.message.from,userrow);
        sendText(updates.message.chat.id,"Data telah berhasil di submit, gunakan /start untuk kembali ke awal");       
        saveUserState(updates.message.from.id,"MAIN");
        sendText("-818042830","Tanggal : "+userrow[5]+"\n"+"Nama : "+userrow[6]+"\n"+"Jumlah :  "+userrow[7]+"\n"+"Lokasi : "+userrow[8]+"\n"+"Keterangan:  "+userrow[9]);
        // sendPhoto("-818042830",userrow[10],userrow[11]);             
      } else {
        sendText(updates.message.chat.id,"Data yang anda input belum finish");
      }
      break;
    case "/hai":
      sendText(updates.message.from.id, "hai juga");
      break;
    default:
      var datarow = getData(comand[0].substring(1),4,"DATA");
  }
}

function saveUser(from,reffid){ 
  var rownum = getUserRow(from.id); 
  if(rownum==0){ 
  var datauser = [   
  [   
    from.id,from.username,from.first_name,reffid,"MAIN"   
  ]   
];   
   
var rangeName = 'USER!A2:D';   
  var valueRange = Sheets.newValueRange();   
  valueRange.values = datauser;   
  var result = Sheets.Spreadsheets.Values.append(valueRange, SheetID, rangeName,{valueInputOption:'USER_ENTERED'}); 
  } else { 
    var datauser = [   
      [   
        from.id,from.username,from.first_name 
      ]   
    ];   
    var rangeName = 'USER!A'+rownum+':C'+rownum;   
    var valueRange = Sheets.newValueRange();   
    valueRange.values = datauser;   
    var result = Sheets.Spreadsheets.Values.update(valueRange, SheetID, rangeName,{valueInputOption:'USER_ENTERED'}); 
  }     
}

function getUserRow(userid){ 
  var rangeName = 'USER!A2:D';   
  var users = Sheets.Spreadsheets.Values.get(SheetID, rangeName).values;   
  if(!users){ 
    return 0; 
  } else { 
    for (var row = 0; row < users.length; row++) {   
      if(users[row][0]==userid){     
        return row+2; 
      }   
    } 
    return 0;      
  } 
}

function getUserState(userid){ 
  var rangeName = 'USER!A2:F';   
  var users = Sheets.Spreadsheets.Values.get(SheetID, rangeName).values;   
  if(!users){ 
    return "MAIN"; 
  } else { 
    for (var row = 0; row < users.length; row++) {   
      if(users[row][0]==userid){     
        return users[row][4]; 
      }   
    } 
    return "MAIN";  
  } 
} 

function saveUserState(userid,state){ 
  var rangeName = 'USER!A2:F';   
  var users = Sheets.Spreadsheets.Values.get(SheetID, rangeName).values;   
  if(!users){ 
  } else { 
    for (var row = 0; row < users.length; row++) {   
      if(users[row][0]==userid){
        var rownum = row+2;
        var datauser = [   
        [   
          state 
        ]   
      ];   
    var rangeName = 'USER!E'+rownum;   
    var valueRange = Sheets.newValueRange();   
    valueRange.values = datauser;   
    var result = Sheets.Spreadsheets.Values.update(valueRange, SheetID, rangeName,{valueInputOption:'USER_ENTERED'});        
      }   
    } 
  } 
}

function saveUserData(userid,state,field){ 
  var rangeName = 'USER!A2:Z';   
  var users = Sheets.Spreadsheets.Values.get(SheetID, rangeName).values;   
  if(!users){ 
  } else { 
    for (var row = 0; row < users.length; row++) {   
      if(users[row][0]==userid){
        var rownum = row+2;
        var datauser = [   
          [   
            state 
          ]   
        ];   
        var rangeName = 'USER!'+field+rownum;   
        var valueRange = Sheets.newValueRange();   
        valueRange.values = datauser;   
        var result = Sheets.Spreadsheets.Values.update(valueRange, SheetID, rangeName,{valueInputOption:'USER_ENTERED'}); 
      }   
    }  
  } 
}

function saveData(from,userData){ 
  var datauser = [   
  [   
    from.id,
      userData[5],
      userData[6],
      userData[7],
      userData[8],
      userData[9],
      userData[10],
      userData[11],
      userData[12],
      userData[13],
      userData[14],
      userData[15],
      userData[16],
      userData[17],
      userData[18],
      userData[19],
      userData[20],
      userData[21],
      userData[22],
      userData[23]
  ]   
];   
   
var rangeName = 'DATA!A2:E';   
  var valueRange = Sheets.newValueRange();   
  valueRange.values = datauser;   
  var result = Sheets.Spreadsheets.Values.append(valueRange, SheetID, rangeName,{valueInputOption:'USER_ENTERED'}); 
}

function getData(searchdata,searchcol,searchsheet){ 
  var rangeName = searchsheet+'!A2:Z';   
  var datas = Sheets.Spreadsheets.Values.get(SheetID, rangeName).values;   
  if(!datas){ 
    return 0; 
  } else { 
    for (var row = 0; row < datas.length; row++) {   
      if(datas[row][searchcol]==searchdata){     
        return datas[row]; 
      }   
    } 
    return 0; 
  } 
}

function sendText(chatid,text,replymarkup){   
var data = {   
    method: "post",   
    payload: {   
      method: "sendMessage",   
      chat_id: String(chatid),   
      text: text,   
      parse_mode: "HTML",   
      reply_markup: JSON.stringify(replymarkup)   
    }   
  };   
  try{
  return JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data));
  }
  catch(e){
    return "{ok:false}";
  }
}

function deleteMessage(chatid,messageid){   
var data = {   
    method: "post",   
    payload: {   
      method: "deleteMessage",   
      chat_id: String(chatid),   
      message_id : messageid 
    }   
  };   
  try{
  return JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data));
  }
  catch(e){
    return "{ok:false}";
  }
}

function sendPhoto(chatid,photo,caption,replymarkup){   
var data = {   
    method: "post",   
    payload: {   
      method: "sendPhoto",   
      chat_id: String(chatid),   
      photo: photo,
      caption : caption,
      parse_mode: "HTML",   
      reply_markup: JSON.stringify(replymarkup)   
    }   
  };   
  try{
  return JSON.parse(UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data));
  }
  catch(e){
    return "{ok:false}";
  }
}

function periksaText(updates) {
  var state = getUserState(updates.message.from.id);
  switch(state){
      case "NEWDATA":
        saveUserData(updates.message.from.id,updates.message.text,"F");
        saveUserState(updates.message.from.id,"NEWDATA2");
        sendText(updates.message.from.id, "Nama : ");
      break;
      case "NEWDATA2":
        var userrow = getData(updates.message.from.id,0,"USER");
        saveUserData(updates.message.from.id,updates.message.text,"G");
        saveUserState(updates.message.from.id,"NEWDATA3");
        sendText(updates.message.from.id, "Jumlah : ");
      break;
      case "NEWDATA3":
        var userrow = getData(updates.message.from.id,0,"USER");
        saveUserData(updates.message.from.id,updates.message.text,"H");
        saveUserState(updates.message.from.id,"NEWDATA4");
        sendText(updates.message.from.id, "Lokasi : ");
      break;
      case "NEWDATA4":
        var userrow = getData(updates.message.from.id,0,"USER");
        saveUserData(updates.message.from.id,updates.message.text,"I");
        saveUserState(updates.message.from.id,"NEWDATA5");
        sendText(updates.message.from.id, "Keterangan : ");   
      break;
      case "NEWDATA5":
        var userrow = getData(updates.message.from.id,0,"USER");
        saveUserData(updates.message.from.id,updates.message.text,"J");
        saveUserState(updates.message.from.id,"FINALIZE");
        sendText(updates.message.from.id,"Tanggal : "+userrow[5]+"\n"+
        "Nama : "+userrow[6]+"\n"+
        "Jumlah : "+userrow[7]+"\n"+
        "Lokasi : "+userrow[8]+"\n"+ 
        "Keterangan : "+updates.message.text+" \n\n"+
        "Klik /finish submit, Terimakasih");
      break;     
    default:      
      sendText(updates.message.from.id,"Perintah tidak dikenali, silahkan kembali ke /start");
  }
}
