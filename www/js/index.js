/* Initial Process */
$(document).ready(function() {
    /* Bind to ViewModel */
    ko.applyBindings(ViewModel);
});

var current_id;    // 現在編集中の行番号。getEntriedStatus()、editRow() 等で値設定する

// メイン画面 記録表の入力状態
var EntriedColumnStatus = {
    ArrivalTime: 0,     // 到着時刻が入力済
    Location: 1,        // 経由地まで入力済
    DepartureTime: 2    // 出発時刻まで入力済
};

var ViewModel = {
    items: ko.observableArray([
        { arrivalTime: "09:00", location: "渋谷", departureTime: "10:05", movingTime: "" },
        { arrivalTime: "10:21", location: "横浜", departureTime: "12:30", movingTime: "0:16" },
        { arrivalTime: "13:05", location: "平塚", departureTime: "15:00", movingTime: "0:35" },
    ]),
    inputArrivalTime: ko.observable(""),
    inputDepartureTime: ko.observable(""),
    inputLocation: ko.observable("Sample"),
    inputLocation2: ko.observable("Sample2"),
    // 経由地編集ダイアログで登録ボタンタップ時の処理
    updateRow: function() {
        ViewModel.items.splice(current_id, 1,
            { arrivalTime: ViewModel.inputArrivalTime(), location: ViewModel.inputLocation(),
            departureTime: ViewModel.inputDepartureTime(), movingTime: getMovingTime() });
        $.mobile.changePage('#main_screen');
    },
    // 経由地名称更新ダイアログで登録ボタンタップ時の処理
    updateLocation: function() {
        var rowdata = ViewModel.items()[current_id];
        ViewModel.items.splice(current_id, 1,
            { arrivalTime: rowdata.arrivalTime, location: ViewModel.inputLocation2(),
            departureTime: rowdata.departureTime, movingTime: rowdata.movingTime });
        $.mobile.changePage('#main_screen');
    },
    // メイン画面 記録ボタンタップ時の処理
    record: function() {
        var status = getEntriedStatus();
        switch (status) {
            case EntriedColumnStatus.ArrivalTime:
                $("#recordLocationDialog").popup("open");
                break;
            case EntriedColumnStatus.Location:
                //出発時刻入力
                var rowdata = ViewModel.items()[current_id];
                ViewModel.items.splice(current_id, 1,
                    { arrivalTime: rowdata.arrivalTime, location: rowdata.location, departureTime: now(), movingTime: rowdata.movingTime });
                break;
            case EntriedColumnStatus.DepartureTime:
                //到着時刻入力
                ViewModel.items.push({ arrivalTime: now(), location: "", departureTime: "", movingTime: getMovingTime() });
                break;
        }
    },
    // メイン画面 記録表の行タップ時の処理
    editRow: function(rowdata, event) {
        current_id = event.target.id;
        ViewModel.inputArrivalTime(rowdata.arrivalTime);
        ViewModel.inputLocation(rowdata.location);
        ViewModel.inputDepartureTime(rowdata.departureTime);
        $('#popupRegist').popup('open');
    }
};

function getMovingTime() {
    return "AA:BB";
}

// 現在の入力済み状態を取得
function getEntriedStatus() {
    var count = ViewModel.items().length;
    var row = count - 1;
    while (row >= 0) {
        current_id = row;
        var rowdata = ViewModel.items()[row];
        if (rowdata.departureTime != "") {
            // 出発時刻まで入力済
            return EntriedColumnStatus.DepartureTime;
        }
        if (rowdata.location != "") {
            // 経由地まで入力済
            return EntriedColumnStatus.Location;
        }
        if (rowdata.arrivalTime != "") {
            // 到着時刻が入力済
            return EntriedColumnStatus.ArrivalTime;
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
