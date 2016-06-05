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

// カスタムバインディング登録
ko.bindingHandlers.date = {
    update: function(element, valueAccessor, allBindings) {
        return ko.bindingHandlers.text.update(element, function() {
            var value = ko.utils.unwrapObservable(valueAccessor());

            if (value == null) {
                return null;
            }
            if (typeof value === "string") {
                return value;
            }
            return value.format('HH:mm');

        }, allBindings, null, null);
    }
};

var ViewModel = {
    items: ko.observableArray([
        { arrivalTime: moment("09:00", "HH:mm"), location: "渋谷", departureTime: moment("10:05", "HH:mm"), movingTime: "" },
        { arrivalTime: moment("10:21", "HH:mm"), location: "横浜", departureTime: moment("12:30", "HH:mm"), movingTime: "0:16" },
        { arrivalTime: moment("13:05", "HH:mm"), location: "平塚", departureTime: moment("14:30", "HH:mm"), movingTime: "0:35" },
    ]),
    inputArrivalTime: ko.observable(""),
    inputDepartureTime: ko.observable(""),
    inputLocation: ko.observable("Sample"),
    inputLocation2: ko.observable("Sample2"),
    // 経由地編集ダイアログで登録ボタンタップ時の処理
    updateRow: function() {
        var previous_rowdata = ViewModel.items()[current_id - 1];
        var previous_departure = moment(previous_rowdata.departureTime);
        var arrival = moment(ViewModel.inputArrivalTime(), "HH:mm");
        var departure = moment(ViewModel.inputDepartureTime(), "HH:mm");
        ViewModel.items.splice(current_id, 1,
            { arrivalTime: arrival, location: ViewModel.inputLocation(),
              departureTime: departure, movingTime: getDifferenceMinutes(arrival, previous_departure) });
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
                    { arrivalTime: rowdata.arrivalTime, location: rowdata.location, departureTime: moment(), movingTime: rowdata.movingTime });
                break;
            case EntriedColumnStatus.DepartureTime:
                //到着時刻入力
                var previous_rowdata = ViewModel.items()[current_id];
                var previous_departure = moment(previous_rowdata.departureTime);
                var arrival = moment();
                ViewModel.items.push({ arrivalTime: arrival, location: "", departureTime: "", movingTime: getDifferenceMinutes(arrival, previous_departure) });
                break;
        }
    },
    // メイン画面 記録表の行タップ時の処理
    editRow: function(rowdata, event) {
        current_id = event.target.id;
        ViewModel.inputArrivalTime(rowdata.arrivalTime.format("HH:mm"));
        ViewModel.inputLocation(rowdata.location);
        if (rowdata.departureTime != "") {
            ViewModel.inputDepartureTime(rowdata.departureTime.format("HH:mm"));
        }
        $('#popupRegist').popup('open');
    }
};

function getDifferenceMinutes(a, b) {
    var min = moment(a.diff(b));
    return min.utc().format('HH:mm');
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

