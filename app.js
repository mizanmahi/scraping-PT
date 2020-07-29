const debug = require('debug')('scraping-PT');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const { JSDOM } = jsdom; 
const axios = require('axios');
const glob = require("glob");

const info = [];

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

        let writer = fs.writeFileSync(`./data/therapist${i+1}.html`, profileHTML);

    })

    const files = glob.sync('./data/*.html');
    files.forEach(file => {

        fs.readFile(file, 'utf8', function(err, data){
            if(err) throw err;
            const dom = new JSDOM(data);
            const { document } = dom.window;
            if(document.querySelector('.icon-website-home')){

                const webLink = document.querySelector('.icon-website-home').closest('a').href;
                const name = document.querySelector('.profile-name-phone h1').textContent.replace(/(\r\n|\n|\r)/gm , '').trim();
                const phone = document.querySelector('.profile-phone span a').innerHTML;

                console.log({name, phone, webLink});
            }

            
        })
       
    })  
    
}
main()

