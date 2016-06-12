var app = {
    /** Constructor
     */
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("pause", this.onPause, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        var mng = new DatabaseManager();
        mng.prepareSqliteDatabase();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    // PauseEvent
    onPause: function() {
        console.log("onPause");
    },
};

var DatabaseManager = (function() {
    // Constructore
    var DatabaseManager = function() {

    };
    var p = DatabaseManager.prototype;

    // Prepare Database
    p.prepareSqliteDatabase = function() {
        console.log("prepareSqliteDatabase");
        var db = window.openDatabase("Database", "1.0", "DriversApp", 200000);
        db.transaction(this.executeDdlQuery, this.onFailDdlQuery, this.onSuccessfulDdlQuery);
    };
    // Execute DDL Query
    p.executeDdlQuery = function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS RouteInfos (id id, name, create_date)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS RoutePoints (id id, point_id, name, arrive_time, departure_time, memo)');
    };
    // Callback of failure
    p.onFailDdlQuery = function(tx, error) {
        //TODO:
    };
    // Callvack of successful
    p.onSuccessfulDdlQuery = function() {
        //TODO:
    };
    return DatabaseManager;
 })();

app.initialize();