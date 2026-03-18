import './App.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle'
import { useEffect, useState } from 'react'
import React from 'react'

function App() {
    const [heroes, setHeroes] = useState([]);
  
    useEffect(() => {
      fetch("http://dragonball-api.com/api-docs") 
        .then(res => res.json())
        .then(data => setHeroes(data))
        .catch(err => console.error(err));
    }, []);

    const filtredHeroes = heroes.filter(hero => hero.name.toLowerCase().includes('goku'));

    return (
      <React.Fragment>
        {heroes.map(hero => (
          <div key={hero.id} className="card" style={{width: '18rem'}}>
            <img src={hero.image} className="card-img-top" alt={hero.name} />
            <div className="card-body">
              <h5 className="card-title">
                {hero.name}
              </h5>
              <p className="card-text">
                {hero.description}
              </p>
              <p className="card-text">
                {hero.race}
              </p>
              <a href="#" className="btn btn-primary">
                Details
              </a>
            </div>
          </div>
        ))}
      </React.Fragment>
    );
}

export default App

