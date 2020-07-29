const debug = require('debug')('scraping-PT');
const fs = require('fs');
const puppeteer = require('puppeteer');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const axios = require('axios');


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

        let writer = fs.createWriteStream(`./data/therapist${i+1}.html`);
        writer.write(profileHTML);

    })

    

    
}
main()

// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://example.com');
//     await page.screenshot({path: 'example.png'});
  
//     await browser.close();
//   })();