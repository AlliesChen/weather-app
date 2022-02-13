const forecast = fetch('https://api.openweathermap.org/data/2.5/weather?q=Taipei&appid=5ae56154b9ca6e943e59b5e4740e026d', {mode: 'cors'})
  .then((fulfilled) => {
    const result = fulfilled.json();
    return result;
  })
  .then((fulfilled) => {
    const obj = fulfilled;
    console.log(obj);  
  })
  .catch((err) => {
    console.error(err);
  });