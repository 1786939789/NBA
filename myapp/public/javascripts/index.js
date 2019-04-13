// schedule
Vue.component('schedule-component', {
    props: ['date', 'datas'],
    data: function(){
        return {

        }
    },
    template: `
    <div class="col-md-12">
        <div class="col-md-12">
            <div class="col-md-2 schedule-date"><span></span><h4>{{ date }}</h4></div>
        </div>
        <div class="col-md-12">
            <ul class="schedule-panel">
                <li v-for="d in datas">
                    <div class="col-md-12 center-block">
                        <div class="col-md-9 team-img">
                            <div class="col-md-5">
                                <a href="javascript:void(0);" @click="check_team($event)" class="clearfix">
                                    <img :src="'./images/teams_logo/'+ d.home_name +'.png'" class="pull-left">
                                    <span class="team-name">{{ d.home_name }}</span>
                                </a>
                            </div>
                            <div class="col-md-2 text-center" style="margin:25px 0 0 0;">
                                <h4>{{d.vs}}</h4>
                                <h5>{{ d.time }}</h5>
                            </div>
                            <div class="col-md-5 text-center">
                                <a href="javascript:void(0);" @click="check_team($event)" class="clearfix">
                                    <span class="team-name">{{ d.away_name }}</span>
                                    <img :src="'./images/teams_logo/'+ d.away_name +'.png'" class="pull-right">
                                </a>
                            </div>
                        </div>
                        <div class="col-md-2 text-center">
                            <a href="javascript: void(0);" @click="check_match($event)"><h4>查看</h4></a>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    `,
    methods: {
        check_team: function(ev){
            var check_team_name = $(ev.target).text().replace(/(^\s*)|(\s*$)/g, "");
            if(!check_team_name){
                check_team_name = $(ev.target).parent().text().replace(/(^\s*)|(\s*$)/g, "");
            }
            var check_team_name_english = team_chinese_to_english[check_team_name];
            var storage = window.localStorage;
            storage.setItem('check_team_name', check_team_name);
            storage.setItem('check_team_name_english', check_team_name_english);
            window.open(window.location.href+'team'); 
        },
        check_match: function(ev){
            var home_name = $(ev.target).parent().parent().parent().find('.col-md-5').eq(0).text().replace(/(^\s*)|(\s*$)/g, "");
            var away_name = $(ev.target).parent().parent().parent().find('.col-md-5').eq(1).text().replace(/(^\s*)|(\s*$)/g, "");
            var storage = window.localStorage;
            storage.setItem('home_name', home_name);
            storage.setItem('away_name', away_name);
            storage.setItem('schedule_date', '');
            window.open(window.location.href + 'match');
        }
    }

});
var schedule = new Vue({
    el: '#schedule',
    data: {
        schedules: [],
    },
    computed: {
        date : function(){
            var my_date = new Date();
            var date = (my_date.getMonth()<9?'0'+(my_date.getMonth()+1):(my_date.getMonth()+1)) + '-' + my_date.getDate();
            return date;
        }
    },
    created() {
        var that = this;
        $.get('/tab/schedule/', function(results){
            if(results.status == 'ok'){
                that.schedules = results.schedules;
            }
        });
    },
    methods: {
        
    },
});
// star_card rank
Vue.component('star-card', {
    props: ['star', 'check'],
    template: `
        <div class="col-md-3">
            <div class="col-md-12 star-card-panel">
                <ul class="evaluate">
                    <li><span class="glyphicon glyphicon-star" aria-hidden="true" :class="{light: star.stars_count>0}"></span></li>
                    <li><span class="glyphicon glyphicon-star" aria-hidden="true" :class="{light: star.stars_count>1}"></span></li>
                    <li><span class="glyphicon glyphicon-star" aria-hidden="true" :class="{light: star.stars_count>2}"></span></li>
                    <li><span class="glyphicon glyphicon-star" aria-hidden="true" :class="{light: star.stars_count>3}"></span></li>
                    <li><span class="glyphicon glyphicon-star" aria-hidden="true" :class="{light: star.stars_count>4}"></span></li>
                </ul>
                <img :src="'images/players/' + star.name + '.png'">
                <div class="row">
                    <ul class="col-md-12 text-center">
                        <li>{{ star.name }}</li><br>
                        <li><strong>得分</strong> {{ star.points }}</li>
                        <li><strong>助攻</strong> {{ star.assists }}</li>
                        <li><strong>罚球</strong> {{ star.penalty_shots }}</li><br>
                        <li><strong>前场</strong> {{ star.off_rebounds }}</li>
                        <li><strong>篮板</strong> {{ star.defend }}</li>
                        <li><strong>两分</strong> {{ star.two_shots }}</li><br>
                        <li><strong>三分</strong> {{ star.three_shots }}</li>
                        <li><strong>中投</strong> {{ star.mid_shots }}</li>
                        <li><strong>远投</strong> {{ star.long_shots }}</li><br>
                        <li><strong>抢断</strong> {{ star.steals }}</li>
                        <li><strong>盖帽</strong> {{ star.blocks }}</li>
                        <li><strong>防守</strong> {{ star.defend }}</li>
                    </ul>
                </div>
            </div>
            <div class="wrap" v-if="star.own==0 && check==true">
            </div>
        </div>
    `,
})
var star_card = new Vue({
    el: '#star-card',
    data: {
        stars: [],
        order_list: {'星级': 'stars_count', '得分': 'points', '两分': 'two_shots', '三分': 'three_shots', 
                    '中投': 'mid_shots', '远投': 'long_shots', '防守': 'defend', '助攻': 'assists',
                    '前场': 'off_rebounds', '后场': 'def_rebouds', '篮板': 'rebounds', '抢断': 'steals',
                    '盖帽': 'blocks', '失误': 'faults', '罚球': 'penalty_shots'},
        index: 0,
    },
    created: function(){
        var that = this;
        $.get('/tab/get_star_card', 'order=' + 'stars_count', function(results){
            if(results.status == 'ok'){
                that.stars = results.datas;
            }
        });
    },
    methods:{
        select_star_card_rank: function(ev){
            var that = this;
            var order = this.order_list[$(ev.target).text()];
            this.index = $(ev.target).parent('li').index();
            $.get('/tab/get_star_card', 'order=' + order, function(results){
                if(results.status == 'ok'){
                    that.stars = results.datas;
                }
            });
        }
    }
});
// competition
var competition = new Vue({
    el: '#competition',
    data: {
        sequence: 0, //第几节
        rounds: 20, //单节回合次数

        star_own: {},
        scores_own: [0, 0, 0, 0],
        stars_competition_own: [],

        star_opp: {},
        scores_opp: [0, 0, 0, 0],
        stars_competition_opp: [],

        stars: [],
        stars_own: [],
        competition_content: [],
    },
    created: function(){
        var that = this;
        $.get('/tab/get_star_card', 'order=' + 'stars_count', function(results){
            if(results.status == 'ok'){
                that.stars = results.datas;
                for(var i=0; i<that.stars.length; ++i){
                    that.stars[i].use = 0; //未使用
                    if(that.stars[i].own == 1){
                        that.stars_own.push(that.stars[i]);
                    }
                }
            }
            that.star_own = that.stars_own[that.get_random_num(0, that.stars_own.length-1)];
            that.star_opp = that.stars[that.get_random_num(0, that.stars.length-1)]
        });
    },
    methods: {
        get_random_num: function(min, max){
            return Math.floor(Math.random()*(max-min+1)+min);
        },
        // 投篮，防守是否成功
        is_success: function(percentage){ //percentage为0<=percentage<=100的整数
            var num = this.get_random_num(0, 100);
            if(percentage >= num)   return true;
            else   return false;
        },
        //选择球星
        select_star: function(ev){
            var text = $(ev.target).text().replace(/(^\s*)|(\s*$)/g, "");
            for(var i=0; i<this.stars_own.length; ++i){
                if(this.stars_own[i].name == text){
                    this.star_own = this.stars_own[i];
                    if(this.sequence <= 3){
                        $('#start-competition').attr('disabled', false);
                    }
                }
            }
        },
        // 获取对方球星
        get_opp_star: function(){
            var num = this.get_random_num(0, this.stars.length-1);
            var flag = false;
            while(!flag){
                if(this.stars[num].use == 0){
                    return this.stars[num];
                }
                num = this.get_random_num(0, this.stars.length-1);
            }
        },
        // 开始比赛
        start_competition: function(ev){
            var that = this;
            // 开始按钮
            ++this.sequence;
            $(ev.target).attr('disabled', true);
            // 比试
            var own = {name: that.star_own.name, mid_shots: 0, mid_hits: 0, long_shots: 0, long_hits: 0, defend: 0};
            var opp = {name: that.star_opp.name, mid_shots: 0, mid_hits: 0, long_shots: 0, long_hits: 0, defend: 0};
            var index = 0;
            var timer_own = setInterval(function(){
                if(++index > that.rounds){
                    clearInterval(timer_own);
                    return;
                }
                //先判断此回合判断是否被防守下来，然后是中投还是远投，最后判断是否投篮成功
                // 主队
                if(!that.is_success(that.star_opp.defend)){ //对方防守失败
                    if(that.is_success(that.star_own.two_shots)){ //中投
                        ++own.mid_shots; //球星中投总个数
                        if(that.is_success(that.star_own.mid_shots)){ //投篮成功
                            that.scores_own[that.sequence-1] += 2;
                            ++own.mid_hits;
                            that.competition_content.push(that.star_own.name + ': 2');
                        }else{ //投篮失败
                            that.competition_content.push(that.star_own.name + ': 投篮失败');
                        }
                    }else{ //远投
                        ++own.long_shots;//球星远投总个数
                        if(that.is_success(that.star_own.long_shots)){ //投篮成功
                            that.scores_own[that.sequence-1] += 3;
                            ++own.long_hits;
                            that.competition_content.push(that.star_own.name + ': 3');
                        }else{ //投篮失败
                            that.competition_content.push(that.star_own.name + ': 投篮失败');
                        }
                    }
                }else{
                    that.competition_content.push(that.star_own.name + ': 投篮失败');
                    ++opp.defend;
                }
            }, 100);
            var timer_opp = setInterval(function(){
                // 客队
                if(index > that.rounds){
                    //结束一节
                    if(that.sequence > 3){
                        $(ev.target).attr('disabled', true);
                        $(ev.target).text('结束');
                    }else{
                        // 单节结束
                        that.star_opp = that.get_opp_star();
                        for(var i=0; i<that.stars_own.length; ++i){
                            if(that.star_own.name == that.stars_own[i].name){
                                that.star_own.use = 1;
                                that.stars_own[i].use = 1;
                            }
                        }
                    }
                    // 球星数据
                    own.scores = that.scores_own[that.sequence-1];
                    opp.scores = that.scores_opp[that.sequence-1];
                    that.stars_competition_own.push(own);
                    that.stars_competition_opp.push(opp);
                    clearInterval(timer_opp);
                    return;
                }
                if(!that.is_success(that.star_own.defend)){ //对方防守失败
                    if(that.is_success(that.star_opp.two_shots)){ //中投
                        ++opp.mid_shots;
                        if(that.is_success(that.star_opp.mid_shots)){ //投篮成功
                            that.scores_opp[that.sequence-1] += 2;
                            ++opp.mid_hits;
                            that.competition_content.push(that.star_opp.name + ': 2');
                        }else{ //投篮失败
                            that.competition_content.push(that.star_opp.name + ': 投篮失败');
                        }
                    }else{ //远投
                        ++opp.long_shots;
                        if(that.is_success(that.star_opp.long_shots)){ //投篮成功
                            that.scores_opp[that.sequence-1] += 3;
                            ++opp.long_hits;
                            that.competition_content.push(that.star_opp.name + ': 3');
                        }else{ //投篮失败
                            that.competition_content.push(that.star_opp.name + ': 投篮失败');
                        }
                    }
                }else{
                    ++own.defend;
                    that.competition_content.push(that.star_opp.name + ': 投篮失败');
                }
            }, 100);
        }
    }
});
//rank
var rank = new Vue({
    el: '#rank',
    data: {
        team_east: [],
        team_west: []
    },
    created: function(){
        var that = this;
        $.get('/tab/rank', function(results){
            if(results.status == 'ok'){
                that.team_east = results.team_rank.east;
                that.team_west = results.team_rank.west;
            }
        });
    }
})