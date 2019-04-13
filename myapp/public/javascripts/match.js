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
Vue.component('statistics-component', {
    props: ['team_name', 'datas'],
    data: function(){
        return {
            table_head: [
                '球员', '时间','得分','投篮','命中率','三分','命中率','罚球','命中率','前场板','后场板','总篮板','助攻','失误','抢断','盖帽','犯规'
            ],
        }
    },
    template: `
        <div class="col-md-12">
            <div class="col-md-12">
                <div class="col-md-2 location-panel"><h4>{{ team_name }}</h4></div>
            </div>
            <div class="col-md-12">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th v-for="t in table_head">{{ t }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="data in datas">
                            <td v-for="d in data" @click="check_player($event)">{{ d }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    methods: {
        check_player: function(ev){
            if($(ev.target).index() == 0){
                var storage = window.localStorage;
                storage.setItem('firstName', $(ev.target).text().split('-')[0]);
                storage.setItem('lastName', $(ev.target).text().split('-')[1]);
                window.open('player.html');
            }
        }
    }
});
Vue.component('match-player-card',{
    props: ['player'],
    data: function(){
        return {
            show: false,
        }
    },
    template: `
        <div class="col-md-2 match-player-card">
            <div class="match-player-card-panel text-center " @mouseenter="check($event)" @mouseleave="close($event)">
                <img :src="'/images/players/'+ player.name +'.png'">
                <div class="data-panel">
                    <div class="title" :style="{paddingTop: player.name.length>9?'2px': '15px'}">
                        <p>{{ player.name }}</p>
                    </div>
                    <ul>
                        <li class="text-center pull-left"><strong>得分</strong><br>{{ player.scores }}</li>
                        <li class="text-center"><strong>篮板</strong><br>{{ player.rebounds }}</li>
                        <li class="text-center pull-right"><strong>助攻</strong><br>{{ player.assists }}</li><br>
                        <li class="text-center pull-left"><strong>投篮</strong><br>{{ player.shots }}</li>
                        <li class="text-center"><strong>三分</strong><br>{{ player.three_shots }}</li>
                        <li class="text-center pull-right"><strong>罚球</strong><br>{{ player.penalty_shots }}</li><br>
                        <li class="text-center pull-left"><strong>抢断</strong><br>{{ player.steals }}</li>
                        <li class="text-center"><strong>盖帽</strong><br>{{ player.blocks }}</li>
                        <li class="text-center pull-right"><strong>per</strong><br>{{ player.per }}</li>
                    </ul>
                </div>
            </div>
        </div>
    `,
    methods: {
        check: function(ev){
            this.show = true;
            $(ev.target).css('bottom', '20px');
        },
        close: function(ev){
            this.show = false;
            $(ev.target).css('bottom', '0px');
        }
    }
});
var match = new Vue({
    el: '#match',
    data: {
        flag: true, //默认显示主队

        home_name: '',
        home_team: [],
        home_points: 0,
        home_best_player: {},
        home_player_comp: {},

        away_name: '',
        away_team: [],
        away_points: 0,
        away_best_player: {},
        away_player_comp: {},

        table_head: ['球员', '时间', '投篮', '三分', '罚球', '前场'
                    , '后场', '篮板', '助攻', '犯规', '抢断', '失误'
                    , '封盖', '得分', '+/-', 'per'],
        max: 81,
    },
    created: function(){
        var that = this;
        var storage = window.localStorage;
        that.home_name = storage.getItem('home_name');
        that.away_name = storage.getItem('away_name');
        var schedule_date = storage.getItem('schedule_date');
        var check_team_name_english = storage.getItem('check_team_name_english');
        var data = 'home_name=' + that.home_name + '&away_name=' + that.away_name 
                    + '&schedule_date=' + schedule_date + '&check_team_name_english=' + check_team_name_english;
        $.get('/tab/match', data, function(results){
            if(results.status == 'ok'){
                that.home_team = results.home_team;
                that.away_team = results.away_team;
                that.home_points = results.home_points;
                that.away_points = results.away_points;
                // 计算per和最佳球员
                that.home_best_player.per = 0;
                for(var i=0; i<that.home_team.length; ++i){
                    if(i <= that.home_team.length-3){
                        that.home_team[i].per = that.computed_per(that.home_team[i]);
                        if(that.home_team[i].per > that.home_best_player.per){
                            that.home_best_player = that.assign_basic_data(that.home_team[i]);
                        }
                    }else{
                        that.home_team[i].per = '';
                    }
                }
                that.away_best_player.per = 0;
                for(var i=0; i<that.away_team.length; ++i){
                    if(i <= that.away_team.length-3){
                        that.away_team[i].per = that.computed_per(that.away_team[i]);
                        if(that.away_team[i].per > that.away_best_player.per){
                            that.away_best_player = that.assign_basic_data(that.away_team[i]);
                        }
                    }else{
                        that.away_team[i].per = '';
                    }
                }
                //比较两个最佳球员的各项数据
                for(key in that.home_best_player){
                    if(key != 'name'){
                        if(Number(that.home_best_player[key]) >= Number(that.away_best_player[key])){
                            that.home_player_comp[key] = true;
                            that.away_player_comp[key] = false;
                        }else{
                            that.home_player_comp[key] = false;
                            that.away_player_comp[key] = true;
                        }
                    }
                } 
            }
        });
    },
    methods:{
        computed_per: function(player){
            var per = 0;
            per = Number(player.scores)+Number(player.assists)*0.7+Number(player.offensive_rebounds)*0.7
		+ Number(player.steals)+Number(player.blocks)*0.7 + Number(player.defensive_rebounds)*0.3
                - Number(player.shots.split('-')[1])*0.7 + Number(player.shots.split('-')[0])*0.4
                - Number(player.penalty_shots.split('-')[1])*0.4 + Number(player.penalty_shots.split('-')[0])*0.4
                - Number(player.faults) - Number(player.fouls)*0.4;
	    per = Math.round(per);
	    return per;
        },
        assign_basic_data: function(player){
            var temp = {};
            temp.name = player.name;
            temp.scores = player.scores;
            temp.assists = player.assists;
            temp.rebounds = player.rebounds;
            temp.steals = player.steals;
            temp.blocks = player.blocks;
            temp.per = player.per;
            return temp;
        },
        check_player: function(ev){
            var text = $(ev.target).text().replace(/(^\s*)|(\s*$)/g, "");
            var storage = window.localStorage;
            storage.setItem('check_player_name', text);
            window.open(window.location.href.split('match')[0] + 'player');
        }
    }
});
