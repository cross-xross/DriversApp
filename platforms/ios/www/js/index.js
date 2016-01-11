var ViewModel = {
	items: ko.observableArray([
		{ startTime: "09:00", location: "渋谷", arrivalTime: "10:05" },
		{ startTime: "10:21", location: "横浜", arrivalTime: "12:30" },
		{ startTime: "13:05", location: "平塚", arrivalTime: "15:00" }
    ]),
    // 登録画面用バインド変数
    startTime:   ko.observable(""),
    location:    ko.observable(""),
    arrivalTime: ko.observable(""),

    // 登録画面表示イベント
    pushShowRegistButton: function() {
    	ViewModel.startTime("");
    	ViewModel.location("");
    	ViewModel.arrivalTime("");
    	$("#popupRegist").popup("open");
    },
	// 登録ボタン押下時のイベント
    pushRegistButton: function() {
    	ViewModel.items.push({ startTime: ViewModel.startTime(), location: ViewModel.location(), arrivalTime: ViewModel.arrivalTime()});
    	// 閉じる
    	$("#popupRegist").popup("close");
    },
    hoge: function() {
    	alert("hoge");
    }
};