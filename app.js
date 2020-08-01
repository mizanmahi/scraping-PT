const debug = require('debug')('scraping-PT');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const { JSDOM } = jsdom; 
const axios = require('axios');
const glob = require("glob");
const { get } = require('http');
const { LOADIPHLPAPI } = require('dns');
require('events').EventEmitter.defaultMaxListeners = 15;


const validateEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;

async function main(){

    debug('Collecting the html content of main page')
    const HTMLContent = await axios('https://www.psychologytoday.com/us/therapists?search=Illinois').then(res => res.data);
    
    debug('Ceating dom..')
    const dom = new JSDOM(HTMLContent);
    const { document } = dom.window;

    const img = document.querySelectorAll('.results-column img');
    const personalLinks = [...img].map(img => img.closest('a').href); 

    personalLinks.forEach( async (link, i) => {

        debug(`Collecting html for no. ${i+1} therapist.. `)
        const profileHTML = await axios(link).then(res => res.data);

        fs.writeFileSync(`./data/therapist${i+1}.html`, profileHTML);

    })

    const files = glob.sync('./data/*.html');

     files.map(file => {
         fs.readFile(file, 'utf8', async function(err, data){
            if(err) throw err;
            const dom = new JSDOM(data);
            const { document } = dom.window;
            if(document.querySelector('.icon-website-home')){// if there is a website icon
         
                let email;
                const personalPageHTML = await axios(document.querySelector('.icon-website-home').closest('a').href).then(res => res.data).then(data => {
                    if(validateEmail.exec(data)){
                        email = validateEmail.exec(data)[0];
                    }else{
                        email = 'n/a';
                    }
                });
            
                const web_link = await getLink(document.querySelector('.icon-website-home').closest('a').href);
                const name = document.querySelector('.profile-name-phone h1').textContent.replace(/(\r\n|\n|\r)/gm , '').trim();
                const phone = document.querySelector('.profile-phone span a').innerHTML;
                const info = {name, phone, web_link, email}
              
                writeFile(JSON.stringify(info));
              
            }else { // if there is not any webite icon
                const web_link = 'n/a';
                const name = document.querySelector('.profile-name-phone h1').textContent.replace(/(\r\n|\n|\r)/gm , '').trim();
                const phone = document.querySelector('.profile-phone span a').innerHTML;
                writeFile(JSON.stringify({name, phone, web_link}));
            }
            
        })
    }) 

}

main();

async function getLink(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //await page.setDefaultNavigationTimeout(0);
    await page.goto(url, {
        waitUntil: "load",
        timeout: 0
    });
    const link = await page.evaluate(() => {
        return document.location.origin;
    })
  
    await browser.close();
    return link;
  }

 function writeFile(data){
     fs.appendFile('./info.csv', data + '\n', err => {
         if(err) err.message;
         console.log('finished writing');
     })
 }