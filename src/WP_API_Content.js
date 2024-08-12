/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


function WP_API_Content() {
    /**
     *  = integer
     *  
     */
    this.id = function () {};

    this.status = function () {
        var _this = {};
        _this.publish = 'publish';
        _this.future = 'future';
        _this.draft = 'draft';
        _this.pending = 'pending';
        _this.private = 'private';

        return _this;
    };
}

var a = new WP_API_Content;
a.status = a.status().draft;