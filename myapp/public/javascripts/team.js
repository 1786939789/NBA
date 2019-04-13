var bus = new Vue();
Vue.prototype.bus = bus;
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
Vue.component('king-component',{
    props: ['player', 'data', 'type'],
    template: `
        <div class="col-md-4 text-center" style="padding-top: 15px;">
            <h5>{{ type + '王'}}</h5>
            <img :src="'./images/small/'+player.name+'.jpg'">
            <h5>{{ player.name }}</h5>
            <h5>{{ type + ':' + data }}</h5>
        </div>
    `
})
var team = new Vue({
    el: '#team-info',
    data: {
        team_name: '',
        team_average_info: [],
        players: [],
        team_schedules: [],
        table_head: ['号码', '球员', '时间', '得分', '助攻', '篮板', '抢断', '盖帽', '失误', '犯规'],
        methods: {'时间':'minutes', '得分':'scores', '助攻':'assists'
                    , '篮板':'rebounds', '抢断':'steals', '盖帽':'blocks'
                    , '失误':'faults', '犯规':'fouls'}
    },
    created: function(){
        var storage = window.localStorage;
        this.team_name = storage.getItem('check_team_name');
        var team_name_english = storage.getItem('check_team_name_english');
        var that = this;
        $.get('/tab/team_info', 'team_name_english=' + team_name_english, function(results){
            if(results.status == 'ok'){
                that.team_average_info = results.team_average_info;
                that.players = results.players;
                that.team_schedules= results.team_schedules;
                that.sort_by_method('得分');
            }
        });
    },
    computed: {
        scores_king: function(){
            var max = Number(this.players[0].scores);
            var temp = this.players[0];
            for(var i=1; i<this.players.length; ++i){
                if(Number(this.players[i].scores) > max){
                    max = Number(this.players[i].scores);
                    temp = this.players[i];
                }
            }
            return temp;
        },
        rebounds_king: function(){
            var max = Number(this.players[0].rebounds);
            var temp = this.players[0];
            for(var i=1; i<this.players.length; ++i){
                if(Number(this.players[i].rebounds) > max){
                    max = Number(this.players[i].rebounds);
                    temp = this.players[i];
                }
            }
            return temp;
        },
        assists_king: function(){
            var max = Number(this.players[0].assists);
            var temp = this.players[0];
            for(var i=1; i<this.players.length; ++i){
                if(Number(this.players[i].assists) > max){
                    max = Number(this.players[i].assists);
                    temp = this.players[i];
                }
            }
            return temp;
        }
    },
    methods: {
        sort: function(ev){
            var method = $(ev.target).text().replace(/(^\s*)|(\s*$)/g, "");
            this.sort_by_method(method);
        },
        sort_by_method: function(method){
            var method = this.methods[method];
            if(method){
                for(var i=0; i<this.players.length; ++i){
                    for(var j=i+1; j<this.players.length; ++j){
                        if(Number(this.players[i][method]) < Number(this.players[j][method])){
                            var temp = this.players[i];
                            this.players[i] = this.players[j];
                            this.players[j] = temp;
                        }
                    }
                }
            }
            team.$forceUpdate()
        },
        check_match: function(ev){
            var home_name = $(ev.target).parent().parent().find('td').eq(0).text().split('vs')[0].replace(/(^\s*)|(\s*$)/g, "");
            var away_name = $(ev.target).parent().parent().find('td').eq(0).text().split('vs')[1].replace(/(^\s*)|(\s*$)/g, "");
            var schedule_date = $(ev.target).parent().parent().find('td').eq(3).text();
            var storage = window.localStorage;
            storage.setItem('home_name', home_name);
            storage.setItem('away_name', away_name);
            storage.setItem('schedule_date', schedule_date);
            window.open(window.location.href.split('team')[0]+'match');
        },
        check_player: function(ev){
            var text = $(ev.target).text().replace(/(^\s*)|(\s*$)/g, "");
            var storage = window.localStorage;
            storage.setItem('check_player_name', text);
            window.open(window.location.href.split('team')[0] + 'player');
        }
    },
});