// ==UserScript==
// @name         Reddit - Saved by Subreddit
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Reddit-Saved-by-Subreddit/raw/master/reddit_saved_by_subreddit.user.js
// @version      0.1
// @description  Filter the list of saved things by subreddit
// @author       LenAnderson
// @match        https://www.reddit.com/user/*/saved/
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';

var subs = {'0000000000':{name:'All Subs',things:[]}};

function loadNext(doc) {
    return new Promise(function(resolve, reject) {
        var next = doc.querySelector('.nav-buttons > .nextprev [rel~="next"]');
        if (next && next.href) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', next.href, true);
            xhr.addEventListener('load', function() {
                var html = document.createRange().createContextualFragment(xhr.responseText);
                getThings(html);
                loadNext(html).then(resolve);
            });
            xhr.send();
        } else {
            resolve();
        }
    });
}

function getThings(doc) {
    Array.prototype.forEach.call(doc.querySelectorAll('#siteTable > .thing'), function(thing) {
        var sub = thing.getAttribute('data-subreddit') || thing.querySelector('a.subreddit.hover').textContent;
        var subl = sub.toLowerCase();
        if (!subs[subl]) {
            subs[subl] = {name:sub, things:[]};
        }
        subs[subl].things.push(thing);
        subs['0000000000'].things.push(thing);
    });
}

function clearSiteTable() {
    Array.prototype.forEach.call(document.querySelectorAll('#siteTable > .thing, #siteTable > .clearleft'), function(thing) {
        thing.remove();
    });
}

getThings(document);
clearSiteTable();
document.querySelector('.nav-buttons > .nextprev').style.display = 'none';

var loading = document.createElement('h1');
loading.textContent = 'building list of saved things...';
loading.style.textAlign = 'center';
loading.style.fontWeight = 'bold';
loading.style.opacity = '0.75';
loading.style.marginTop = '3em';
document.querySelector('#siteTable').appendChild(loading);

loadNext(document).then(function() {
    document.querySelector('.nav-buttons > .nextprev').remove();
    loading.remove();

    var spacer = document.createElement('div');
    spacer.classList.add('spacer');
    var scb = document.createElement('div');
    scb.classList.add('sidecontentbox');
    spacer.appendChild(scb);
    var title = document.createElement('div');
    title.classList.add('title');
    scb.appendChild(title);
    var titleH1 = document.createElement('h1');
    titleH1.textContent = 'FILTER SAVED THINGS BY SUBREDDIT';
    title.appendChild(titleH1);
    var ul = document.createElement('ul');
    ul.classList.add('content');
    scb.appendChild(ul);
    Object.keys(subs).sort().forEach(function(sub) {
        var li = document.createElement('li');
        li.textContent = subs[sub].name + ' (' + subs[sub].things.length + ')';
        li.style.cursor = 'pointer';
        li.addEventListener('click', function() {
            clearSiteTable();
            subs[sub].things.forEach(function(thing) {
                document.querySelector('#siteTable').appendChild(thing);
                var clearleft = document.createElement('div');
                clearleft.classList.add('clearleft');
                document.querySelector('#siteTable').appendChild(clearleft);
                var cur = ul.querySelector('.selected');
                if (cur) {
                    cur.classList.remove('selected');
                }
                li.classList.add('selected');
            });
        });
        ul.appendChild(li);
    });
    
    var side = document.querySelector('.side');
    side.insertBefore(spacer, side.firstChild);
});
