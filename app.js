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


const validateEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/; //email validation pattern

async function main(){

    debug('Collecting the html content of main page')
    const HTMLContent = await axios('https://www.psychologytoday.com/us/therapists?search=Illinois').then(res => res.data); // extracting html data from the main page
    
    debug('Ceating dom..')
    const dom = new JSDOM(HTMLContent); // creating dom by the main pages's hml
    const { document } = dom.window;  // destructuring document proprtie from dom.window object

    const img = document.querySelectorAll('.results-column img'); // getting all the images by this selector ".result-column img"
    const personalLinks = [...img].map(img => img.closest('a').href); // looping through the images and getting the link from their corrasponding closest a tag 

    personalLinks.forEach( async (link, i) => { // looping through the all personal links

        debug(`Collecting html for no. ${i+1} therapist.. `)
        const profileHTML = await axios(link).then(res => res.data); // getting html data 

        fs.writeFileSync(`./data/therapist${i+1}.html`, profileHTML); // saving data in a html file

    })

    const files = glob.sync('./data/*.html'); // getting the all html file from data folder

     files.map(file => { // looping through them
         fs.readFile(file, 'utf8', async function(err, data){
            if(err) throw err;
            const dom = new JSDOM(data); // creating dom for all prsonal links html
            const { document } = dom.window;
            if(document.querySelector('.icon-website-home')){// if there is a website icon
         
                let email;
                // extracting email if there is one
                const personalPageHTML = await axios(document.querySelector('.icon-website-home').closest('a').href).then(res => res.data).then(data => {
                    if(validateEmail.exec(data)){
                        email = validateEmail.exec(data)[0];
                    }else{
                        email = 'n/a';
                    }
                });
            
                const web_link = await getLink(document.querySelector('.icon-website-home').closest('a').href); // getting the actual link
                const name = document.querySelector('.profile-name-phone h1').textContent.replace(/(\r\n|\n|\r)/gm , '').trim(); //getting the name 
                const phone = document.querySelector('.profile-phone span a').innerHTML; //getting the phone number
                const info = {name, phone, web_link, email}
              
                writeFile(JSON.stringify(info)); // writing info in a csv file
              
            }else { // if there is not any webite icon
                const web_link = 'n/a';
                const name = document.querySelector('.profile-name-phone h1').textContent.replace(/(\r\n|\n|\r)/gm , '').trim();//getting the name 
                const phone = document.querySelector('.profile-phone span a').innerHTML; //getting the phone number
                writeFile(JSON.stringify({name, phone, web_link})); // writing info in a csv file
            }
            
        })
    }) 

}

main();

async function getLink(url){ // funtion to get the actual url
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //await page.setDefaultNavigationTimeout(0);
    await page.goto(url, {
        waitUntil: "load",
        timeout: 0
    });
    const link = await page.evaluate(() => {
        return document.location.origin; // getting the actual url
    })
  
    await browser.close();
    return link;
  }

 function writeFile(data){ // function to write csv file
     fs.appendFile('./info.csv', data + '\n', err => {
         if(err) err.message;
         console.log('finished writing');
     })
 }