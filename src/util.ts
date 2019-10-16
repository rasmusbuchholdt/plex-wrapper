let xml2js = require('xml2js');

export function parseXML(xmlString: string): Promise<string> {
  let parser = new xml2js.Parser();
  return new Promise((resolve: any) => {
    parser.parseStringPromise(xmlString).then((result: any) => {
      resolve(result);
    });
  });
}
