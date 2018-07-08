/*飞机*/
var Plane = function (opts) {
    this.opts = opts || {};
    //console.log('Enemy opts',opts);
    //调用父类方法
    Element.call(this, opts);

    //特有属性状态和图标
    this.status = 'normal';
    this.width = opts.width;
    this.height = opts.height;
    this.planeIcon = opts.planeIcon;
    this.minX = opts.minX;
    this.maxX = opts.maxX;
};
//继承Element方法
inheritPrototype(Plane, Element);

//方法：绘制飞机
Plane.prototype.draw = function () {
    //this.shoot();
    //this.drawBullets();
    var planeIcon = new Image();
    planeIcon.src = this.planeIcon;
    ctx.drawImage(planeIcon, this.x, this.y, this.width, this.height);
    return this;
};
//方法：飞机方向
Plane.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;
    //this.draw();
    //this.move(this.x, this.y);
    return this;//方便链式调用
};
//方法：发射子弹
// Plane.prototype.shoot = function () {
//     var self = this;
//     //console.log(bulletPosX);
//     this.shooting = setInterval(function () {
//         var bulletPosX = self.x + self.width / 2;//要放在setInterval内部才会跟着飞机移动
//         self.bullets.push(new Bullet({
//             x: bulletPosX,
//             y: self.y,
//             size: self.bulletSize,
//             speed: self.bulletSpeed
//         }));
//     }, 500);
//     //console.log(this.bullets);
//     return this;
// };

//方法：碰撞检测
Plane.prototype.hasCrash = function(target){
    var crash = false;
    if(!(target.x + target.size < this.x) &&
    !(this.x + this.width < target.x) &&
    !(target.y + target.size < this.y) &&
    !(this.y + this.height < target.y)){
        crash = true;
        //this.status = 'booming';
        //clearInterval(this.shooting);
    }
    return crash;
};