var timer = setInterval(function(){
    if(++index > 20) clearInterval(timer);
    //先判断此回合判断是否被防守下来，然后是中投还是远投，最后判断是否投篮成功
    // 主队
    if(that.is_success(that.star_own.defend)){ //对方防守成功
        if(that.is_success(that.star_opp.two_shots)){ //中投
            if(that.is_success(that.star_own.mid_shots)){ //投篮成功
                that.scores_own[that.sequence-1] += 2;
            }else{ //投篮失败
                console.log('投篮失败');
            }
        }else{ //远投
            if(that.is_success(that.star_own.long_shots)){ //投篮成功
                that.scores_own[that.sequence-1] += 3;
            }else{ //投篮失败
                console.log('投篮失败');
            }
        }
    }
    // 客队
    if(that.is_success(that.star_opp.defend)){ //对方防守成功
        if(that.is_success(that.star_own.two_shots)){ //中投
            if(that.is_success(that.star_opp.mid_shots)){ //投篮成功
                that.scores_opp[that.sequence-1] += 2;
            }else{ //投篮失败
                console.log('投篮失败');
            }
        }else{ //远投
            if(that.is_success(that.star_opp.long_shots)){ //投篮成功
                that.scores_opp[that.sequence-1] += 3;
            }else{ //投篮失败
                console.log('投篮失败');
            }
        }
    }
}, 100);