import {
  PDFArray,
  PDFBool,
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFRef,
  PDFString,
  PDFObject,
} from 'src/core';
import { toCharCode, typedArrayFor } from 'src/utils';

describe(`PDFDict`, () => {
  const context = PDFContext.create();

  it(`can be constructed from PDFDict.withContext(...)`, () => {
    expect(PDFDict.withContext(context)).toBeInstanceOf(PDFDict);
  });

  const pdfDict = PDFDict.withContext(context);

  const pdfBool = PDFBool.True;
  const pdfHexString = PDFHexString.of('ABC123');
  const pdfName = PDFName.of('Foo#Bar!');
  const pdfNull = PDFNull;
  const pdfNumber = PDFNumber.of(-24.179);
  const pdfString = PDFString.of('foobar');
  const pdfRef = PDFRef.of(21, 92);

  pdfDict.set(PDFName.of('Boolean'), pdfBool);
  pdfDict.set(PDFName.of('HexString'), pdfHexString);
  pdfDict.set(PDFName.of('Name'), pdfName);
  pdfDict.set(PDFName.of('Null'), pdfNull);
  pdfDict.set(PDFName.of('Number'), pdfNumber);
  pdfDict.set(PDFName.of('String'), pdfString);
  pdfDict.set(PDFName.of('Ref'), pdfRef);

  const pdfArray = PDFArray.withContext(context);
  pdfArray.push(PDFBool.True);
  pdfArray.push(PDFNull);

  const pdfSubDict = PDFDict.withContext(context);
  pdfSubDict.set(PDFName.of('Array'), pdfArray);

  pdfDict.set(PDFName.of('Dictionary'), pdfSubDict);

  it(`can detect if a value is present`, () => {
    expect(pdfDict.has(PDFName.of('Boolean'))).toBe(true);
    expect(pdfDict.has(PDFName.of('HexString'))).toBe(true);
    expect(pdfDict.has(PDFName.of('Name'))).toBe(true);
    expect(pdfDict.has(PDFName.of('Null'))).toBe(false);
    expect(pdfDict.has(PDFName.of('Number'))).toBe(true);
    expect(pdfDict.has(PDFName.of('String'))).toBe(true);
    expect(pdfDict.has(PDFName.of('Ref'))).toBe(true);
    expect(pdfDict.has(PDFName.of('Dictionary'))).toBe(true);
    expect(pdfSubDict.has(PDFName.of('Array'))).toBe(true);
    expect(pdfDict.has(PDFName.of('foo'))).toBe(false);
  });

  it(`retains entered objects`, () => {
    expect(pdfDict.entries().length).toBe(8);

    expect(pdfDict.get(PDFName.of('Boolean'))).toBe(pdfBool);
    expect(pdfDict.get(PDFName.of('HexString'))).toBe(pdfHexString);
    expect(pdfDict.get(PDFName.of('Name'))).toBe(pdfName);
    expect(pdfDict.get(PDFName.of('Null'))).toBe(pdfNull);
    expect(pdfDict.get(PDFName.of('Number'))).toBe(pdfNumber);
    expect(pdfDict.get(PDFName.of('String'))).toBe(pdfString);
    expect(pdfDict.get(PDFName.of('Ref'))).toBe(pdfRef);
    expect(pdfDict.get(PDFName.of('Dictionary'))).toBe(pdfSubDict);
    expect(pdfSubDict.get(PDFName.of('Array'))).toBe(pdfArray);
  });

  it(`can be converted to a Map`, () => {
    expect(pdfDict.asMap()).toEqual(
      new Map<PDFName, PDFObject>([
        [PDFName.of('Boolean'), pdfBool],
        [PDFName.of('HexString'), pdfHexString],
        [PDFName.of('Name'), pdfName],
        [PDFName.of('Null'), pdfNull],
        [PDFName.of('Number'), pdfNumber],
        [PDFName.of('String'), pdfString],
        [PDFName.of('Ref'), pdfRef],
        [PDFName.of('Dictionary'), pdfSubDict],
      ]),
    );
  });

  it(`can be cloned`, () => {
    const original = pdfDict;
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.toString()).toBe(original.toString());
  });

  it(`can be converted to a string`, () => {
    expect(String(pdfDict)).toBe(
      `<<
/Boolean true
/HexString <ABC123>
/Name /Foo#23Bar!
/Null null
/Number -24.179
/String (foobar)
/Ref 21 92 R
/Dictionary <<
/Array [ true null ]
>>
>>`,
    );
  });

  it(`can provide its size in bytes`, () => {
    expect(pdfDict.sizeInBytes()).toBe(153);
  });

  it(`can be serialized`, () => {
    const buffer = new Uint8Array(157).fill(toCharCode(' '));
    expect(pdfDict.copyBytesInto(buffer, 3)).toBe(153);
    expect(buffer).toEqual(
      typedArrayFor(
        `   <<
/Boolean true
/HexString <ABC123>
/Name /Foo#23Bar!
/Null null
/Number -24.179
/String (foobar)
/Ref 21 92 R
/Dictionary <<
/Array [ true null ]
>>
>> `,
      ),
    );
  });
});
