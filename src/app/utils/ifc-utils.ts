import { IfcProperty } from '../models/interfaces';

export function parseElementDetailsFromIFCExpressID(ifcText: string, id: number): IfcProperty {
  const expressId = `#${id}=`;
  const lineIndex = ifcText.indexOf(expressId);
  let line = '';
  for (let i = lineIndex; i < lineIndex + 500; i++) {
    if (ifcText[i] === '\n' || ifcText[i] === '\r') break;
    line += ifcText[i];
  }
  if (line.includes('IFCQUANTITY')) {
    return parseIFCQuantity(line);
  } else if (line.includes('IFCPROPERTYSINGLEVALUE')) {
    return parseIFCPropertySingleValue(line);
  }
  return {
    name: line.split('(')[0].replace(/[^a-zA-Z]/g, ''),
    value: id.toString()
  };
}

function parseIFCQuantity(line: string): IfcProperty {
  let propertyName = '';
  let propertyValue = '';
  let roundBracketCount = 0;
  let quoteCount = 0;
  let propertyCount = 0;
  let tempLine = '';

  for (const char of line) {
    if (char === '(' && roundBracketCount === 0) {
      propertyCount++;
      roundBracketCount++;
    } else if (char === '(' && roundBracketCount > 0) {
      roundBracketCount++;
      tempLine += char;
    } else if (char === ')' && roundBracketCount === 1) {
      roundBracketCount--;
    } else if (char === ')' && roundBracketCount > 1) {
      roundBracketCount--;
      tempLine += char;
    } else if (char === '\'' && quoteCount === 0) {
      quoteCount++;
    } else if (char === '\'' && quoteCount > 0) {
      quoteCount--;
    } else if (char === ',' && roundBracketCount === 1 && quoteCount === 0) {
      propertyCount++;
      if (propertyCount === 2) {
        propertyName = tempLine;
        tempLine = '';
      } else if (propertyCount === 5) {
        propertyValue = tempLine;
        tempLine = '';
      }
    } else if (char !== '$') {
      if (roundBracketCount > 0) {
        tempLine += char;
      }
    }
  }
  if (propertyName === propertyValue) propertyValue = '';
  return {
    name: propertyName,
    value: propertyValue.replace('.F.', 'False').replace('.T.', 'True').replace('.U.', 'Unknown')
  };
}

function parseIFCPropertySingleValue(line: string): IfcProperty {
  const propertyName = line.split('(')[1].split(',')[0].replace(/'/g, '');
  let propertyValue = line.split('(')[2].split(')')[0].replace(/'/g, '');
  if (propertyName === propertyValue) propertyValue = '';
  return {
    name: propertyName,
    value: propertyValue.replace('.F.', 'False').replace('.T.', 'True').replace('.U.', 'Unknown')
  };
}
