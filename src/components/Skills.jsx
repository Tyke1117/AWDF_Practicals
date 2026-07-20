import 'react';

export default function SKills() {
  return (
      <div style={{ flex:1, paddingBottom: '20px' }}>
      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          justifyContent:'center'
        }}
      >
        <li style={{border:'1px solid blue', paddingTop:'10px',paddingBottom:'10px',paddingLeft:'20px',paddingRight:'20px',borderRadius:'20px'}}>React.js</li>
        <li style={{border:'1px solid blue', paddingTop:'10px',paddingBottom:'10px',paddingLeft:'20px',paddingRight:'20px',borderRadius:'20px'}}>React Native</li>
        <li style={{border:'1px solid blue', paddingTop:'10px',paddingBottom:'10px',paddingLeft:'20px',paddingRight:'20px',borderRadius:'20px'}}>Digital Image Processing</li>
        <li style={{border:'1px solid blue', paddingTop:'10px',paddingBottom:'10px',paddingLeft:'20px',paddingRight:'20px',borderRadius:'20px'}}>Python (Programming Language)</li>
        <li style={{border:'1px solid blue', paddingTop:'10px',paddingBottom:'10px',paddingLeft:'20px',paddingRight:'20px',borderRadius:'20px'}}>Mobile Computing</li>
      </ul>
    </div>
  );
}
