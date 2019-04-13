//nav-area-black
var nav_area_black = new Vue({
    el: '#nav-area-black',
    data: {
        username: ''
    },
    created: function () {
        var storage = window.localStorage;
        this.username = storage.getItem('username');
    },
    mounted: function(){

    },
    methods: {
        user_info: function(){
            //个人信息
        },
        exit: function () {
            window.location.href = 'homePage.html';
        }
    }
});
var forecast = new Vue({
    el: '#forecast',
    data: {
        loading: true,
        home_name: '',
        opp_name: '',
        home_forecast: {},
        opp_forecast: {},
        home_team_info:{},
        opp_team_info:{},
        matches: []
    },
    created: function(){
        var that = this;
        var storage = window.localStorage;
        that.home_name = storage.getItem('homeName');
        that.opp_name = storage.getItem('oppName');
        var data = 'homeName=' + that.home_name + '&oppName=' + that.opp_name;
        $.get('http://192.168.43.4:8888/nba/team/forecast', data, function(results){
            that.home_forecast = results.homeForecast;
            that.opp_forecast = results.oppForecast;
            that.home_team_info = results.homeTeamInfo;
            that.opp_team_info = results.oppTeamInfo;
            for(var i=0; i<results.matches.length; ++i){
                var temp = {};
                temp.type = results.matches[i].type;
                temp.date = results.matches[i].date;
                temp.home_name = results.matches[i].homeName;
                temp.score = results.matches[i].homeScore + '-' + results.matches[i].awayScore;
                temp.away_name = results.matches[i].awayName;
                that.matches.push(temp);
            }
            that.loading = false;
        });
    },
    methods: {
        
    },
})