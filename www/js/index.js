/* Initial Process */
$(document).ready(function() {
    /* Bind to ViewModel */
    ko.applyBindings(ViewModel);
});

var current_id;    // getEntriedStatus()、editRow() 等で値設定する

var ViewModel = {
    items: ko.observableArray([
        { arrivalTime: "09:00", location: "渋谷", departureTime: "10:05" },
        { arrivalTime: "10:21", location: "横浜", departureTime: "12:30" },
        { arrivalTime: "13:05", location: "平塚", departureTime: "15:00" },
    ]),
    inputArrivalTime: ko.observable(""),
    inputDepartureTime: ko.observable(""),
    inputLocation: ko.observable("Sample"),
    inputLocation2: ko.observable("Sample2"),
    // 経由地編集ダイアログで登録ボタンタップ時の処理
    updateRow: function() {
        ViewModel.items.splice(current_id, 1,
            { arrivalTime: ViewModel.inputArrivalTime(), location: ViewModel.inputLocation(), departureTime: ViewModel.inputDepartureTime() });
        $.mobile.changePage('#main_screen');
    },
    // 経由地名称更新ダイアログで登録ボタンタップ時の処理
    updateLocation: function() {
        var rowdata = ViewModel.items()[current_id];
        ViewModel.items.splice(current_id, 1,
            { arrivalTime: rowdata.arrivalTime, location: ViewModel.inputLocation2(), departureTime: rowdata.departureTime });
        $.mobile.changePage('#main_screen');
    },
    record: function() {

    var status = getEntriedStatus();
//alert('status:' + status + ', current_id:' + current_id);
    switch (status) {
        case 0:
            $("#recordLocationDialog").popup("open");
            break;
        case 1:
            //出発時刻入力
            var rowdata = ViewModel.items()[current_id];
            ViewModel.items.splice(current_id, 1,
                { arrivalTime: rowdata.arrivalTime, location: rowdata.location, departureTime: now() });
            break;
        case 2:
            //到着時刻入力
            ViewModel.items.push({ arrivalTime: now(), location: "", departureTime: "" });
            break;
    }


    }
};

function editRow(element) {
    var row = element.id;
    var data = ViewModel.items()[row];
    ViewModel.inputArrivalTime(data.arrivalTime);
    ViewModel.inputLocation(data.location);
    ViewModel.inputDepartureTime(data.departureTime);
    current_id = element.id;
    $('#popupRegist').popup('open');
}

// メイン画面記録ボタンタップ時の処理
//function record() {
//    var status = getEntriedStatus();
//alert('status:' + status + ', current_id:' + current_id);
//    switch (status) {
//        case 0:
//            $("#recordLocationDialog").popup("open");
//            break;
//        case 1:
//            //出発時刻入力
//            var rowdata = ViewModel.items()[current_id];
//            ViewModel.items.splice(current_id, 1,
//                { arrivalTime: rowdata.arrivalTime, location: rowdata.location, departureTime: now() });
//            break;
//        case 2:
//            //到着時刻入力
//            ViewModel.items.push({ arrivalTime: now(), location: "", departureTime: "" });
//            break;
//    }
//}

// 現在の入力済み状態を取得
function getEntriedStatus() {
    var count = ViewModel.items().length;
    var row = count - 1;
    while (row >= 0) {
        current_id = row;
        var rowdata = ViewModel.items()[row];
        if (rowdata.departureTime != "") {
            //出発時刻まで入力済
            return 2;
        }
        if (rowdata.location != "") {
            //経由地まで入力済
            return 1;
        }
        if (rowdata.arrivalTime != "") {
            //到着時刻が入力済
            return 0;
        }
        row--;
    }
    return -1;
}

// 現在時刻取得
function now() {
    var current = new Date();
    return (current.getHours() + ':' + current.getMinutes());
}
