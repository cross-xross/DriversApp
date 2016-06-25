/* Initial Process */
$(document).ready(function() {
    /* Bind to ViewModel */
    ko.applyBindings(ViewModel);
});

/** TemporaryInputData Format Class
 */
var Location = (function() {
    /** Constructor
     */
    var Location = function(arrival, locationName, departure, moving) {
        this.arrivalTime   = ko.observable(arrival);      // moment
        this.locationName  = ko.observable(locationName); // string
        this.departureTime = ko.observable(departure);    // moment
        if (typeof moving == 'string') {                  // string
            this.movingTime = ko.observable(moving);      // 前の地点からの移動時間 (string) が指定された場合
        } else if (typeof moving == 'object') {           // 前の地点の departureTime (moment) が指定された場合
            var min_diff = p.__getDifferenceMinutes(arrival, moving);
            this.movingTime = ko.observable(min_diff);
        }
    };

    var p = Location.prototype;

    /** Copy Constructor
     */
    p.clone = function() {
        return new Location(this.arrivalTime(), this.locationName(), this.departureTime(), this.movingTime());
    }

    p.updateMovingTime = function(previous_location) {
        if (previous_location != "") {
            this.movingTime(p.__getDifferenceMinutes(this.arrivalTime(), previous_location.departureTime()));
        }
    }

    /** [Private]
     */
    p.__getDifferenceMinutes = function(a, b) {
        var min_diff = moment(a.diff(b));
        return min_diff.utc().format('H:mm');
    }

    return Location;
})();

/**
 */
var DriveEntity = (function() {
    var DriveEntity = function(name, create_data) {
        this.name        = ko.observable(name);
        this.create_data = ko.observable(create_data);
    };
    return DriveEntity;
})();

/**
 */
var DriveEntity = (function() {
    var DriveEntity = function(name, create_data) {
        this.name        = ko.observable(name);
        this.create_data = ko.observable(create_data);
    };
    return DriveEntity;
})();

// メイン画面 記録表の入力状態
var EntriedColumnStatus = {
    FirstData    :-1,     // 1件目のデータ
    ArrivalTime  : 0,     // 到着時刻が入力済
    LocationName : 1,     // 経由地まで入力済
    DepartureTime: 2      // 出発時刻まで入力済
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

/** Define ViewModel
 */
var ViewModel = {

    driveName: ko.observable(""),

    driveList: ko.observableArray([]),

    /** Route Information Data.
     */
    LocationList: ko.observableArray([]),

    /** Tempolary Input Data.
     */
    LocationOnDialog: new Location("", "", "", ""),

    /** Editing row number
     */
    current_id: 0,

    /**
     */
    showDetailTrip: function() {
        ViewModel.driveList.push(new DriveEntity(moment().format("YYYY年MM月DD日") + "のドライブ", moment()));
    },
    transitDetailPage: function() {
        ViewModel.LocationList([]);
        ViewModel.current_id = 0;
        $.mobile.changePage('#main_screen');
    },
    test: function() {
        console.log("sample");
    },
    // 経由地情報変更（経由地編集ダイアログで登録ボタンクリック）
    updateRow: function(place) {
        // 変更対象の経由地データを取得
        var current_location = ViewModel.LocationList()[ViewModel.current_id];
        // 変更対象の一つ前の経由地データを取得
        var previous_location = "";
        if (ViewModel.current_id != 0) {
            var previous_location = ViewModel.LocationList()[ViewModel.current_id - 1];
        }

        // 入力された到着時刻とそれから計算される移動時間を変更対象の経由地に反映
        var input_arrival = ViewModel.LocationOnDialog.arrivalTime();
        if (input_arrival != "") {
            current_location.arrivalTime(moment(input_arrival, "HH:mm"));
            current_location.updateMovingTime(previous_location);
        }
        // 入力された経由地名称を変更対象の経由地に反映
        current_location.locationName(ViewModel.LocationOnDialog.locationName());
        // 入力された出発時刻を変更対象の経由地に反映
        var input_departure = ViewModel.LocationOnDialog.departureTime();
        if (input_departure != "") {
            current_location.departureTime(moment(input_departure, "HH:mm"));

            // 変更対象の経由地が最後のデータでない場合、次の経由地の移動時間を更新
            if (ViewModel.LocationList().length - 1 > ViewModel.current_id) {
                var idx = ViewModel.current_id + 1;
                var next_location = ViewModel.LocationList()[idx];
                next_location.updateMovingTime(current_location);
            }
        }

        $.mobile.changePage('#main_screen');
    },
    // 経由地名称変更（経由地名称更新ダイアログで登録ボタンクリック）
    updateLocationName: function() {
        if (ViewModel.LocationList().length == 0) {
            ViewModel.LocationList.push(new Location("", ViewModel.LocationOnDialog.locationName(), "", ""));
        } else {
            var current_location = ViewModel.LocationList()[ViewModel.current_id];
            current_location.locationName(ViewModel.LocationOnDialog.locationName());
        }
        $.mobile.changePage('#main_screen');
    },
    // 到着時刻、経由地名称、出発時刻記録（メイン画面 記録ボタンクリック）
    record: function() {
        var status = ViewModel.__getEntriedStatus();
        switch (status) {
            case EntriedColumnStatus.ArrivalTime:
                ViewModel.LocationOnDialog.locationName("");
                $("#recordLocationNameDialog").popup("open");
                break;
            case EntriedColumnStatus.LocationName:
                //出発時刻入力
                var current_location = ViewModel.LocationList()[ViewModel.current_id];
                current_location.departureTime(moment());
                break;
            case EntriedColumnStatus.DepartureTime:
                //到着時刻入力
                var previous_location = ViewModel.LocationList()[ViewModel.current_id];
                var arrival           = moment();
                ViewModel.LocationList.push(new Location(arrival, "", "", previous_location.departureTime()));
                break;
            case EntriedColumnStatus.FirstData:
                $("#recordLocationNameDialog").popup("open");
                //ViewModel.LocationList.push(new Location(moment("09:00", "HH:mm"), "渋谷", moment("10:05", "HH:mm"), ""));
                break;
        }
    },
    // 経由地情報変更ダイアログ表示（メイン画面 記録表の行クリック）
    editRow: function(current_location, event) {
        ViewModel.current_id = parseInt(event.target.id);
        // ダイアログの到着時刻初期値を設定
        var arrivalTime = "";
        if (current_location.arrivalTime() != "") {
            arrivalTime = current_location.arrivalTime().format("HH:mm");
        }
        ViewModel.LocationOnDialog.arrivalTime(arrivalTime);
        // ダイアログの経由地名称初期値を設定
        ViewModel.LocationOnDialog.locationName(current_location.locationName());
        // ダイアログの到着時刻初期値を設定
        var departureTime = "";
        if (current_location.departureTime() != "") {
            departureTime = current_location.departureTime().format("HH:mm");
        }
        ViewModel.LocationOnDialog.departureTime(departureTime);
        $('#updateLocationDialog').popup('open');
    },
    /** [Private]
     */
    __getEntriedStatus: function() {
        var count = ViewModel.LocationList().length;
        var row   = count - 1;
        while (row >= 0) {
            ViewModel.current_id  = row;
            var current_location = ViewModel.LocationList()[row];
            if (current_location.departureTime() != "") {
                // 出発時刻まで入力済
                return EntriedColumnStatus.DepartureTime;
            }
            if (current_location.locationName() != "") {
                // 経由地まで入力済
                return EntriedColumnStatus.LocationName;
            }
            if (current_location.arrivalTime() != "") {
                // 到着時刻が入力済
                return EntriedColumnStatus.ArrivalTime;
            }
            row--;
        }
        return -1;
    },
};
