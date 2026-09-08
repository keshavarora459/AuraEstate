const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'
];

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    const collection = mongoose.connection.db.collection('properties');
    
    const count = await collection.countDocuments();
    console.log(`Found ${count} total documents in properties collection.`);

    const cursor = collection.find({});
    const bulkOps = [];
    let processed = 0;
    let index = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      index++;

      const title = doc.street_address || (typeof doc.address === 'string' ? doc.address.split(',')[0].trim() : '') || `${doc.bedrooms || 2} Bed Property in ${doc.suburb_name || 'Australia'}`;
      
      let priceNumeric = doc.price_numeric;
      if (!priceNumeric || typeof priceNumeric !== 'number') {
        if (typeof doc.price === 'number') {
          priceNumeric = doc.price;
        } else if (typeof doc.price === 'string') {
          const digits = doc.price.replace(/[^0-9]/g, '');
          priceNumeric = parseInt(digits, 10) || 650000;
        } else {
          priceNumeric = 650000;
        }
      }

      // Consistent images per property based on hash
      const img1 = IMAGES[index % IMAGES.length];
      const img2 = IMAGES[(index + 3) % IMAGES.length];
      const img3 = IMAGES[(index + 6) % IMAGES.length];
      const propImages = (Array.isArray(doc.images) && doc.images.length > 0) ? doc.images : [img1, img2, img3];

      const suburb = doc.suburb_name || (typeof doc.address === 'string' ? doc.address.split(',')[1]?.trim() : '') || 'Barton';
      const state = doc.state_code || 'ACT';
      const postcode = String(doc.postcode || 2600);
      const street = doc.street_address || (typeof doc.address === 'string' ? doc.address.split(',')[0]?.trim() : '') || 'Main Street';

      const desc = (doc.description || '').toLowerCase();
      const pType = doc.property_type || (desc.includes('apartment') ? 'Apartment' : desc.includes('house') ? 'Residential' : 'Apartment');

      bulkOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              status: 'Published',
              title: title,
              price: priceNumeric,
              price_numeric: priceNumeric,
              priceGuide: typeof doc.price === 'string' ? doc.price : `$${priceNumeric.toLocaleString()}`,
              images: propImages,
              propertyType: pType,
              listingType: 'Sale',
              address: {
                street: street,
                suburb: suburb,
                city: suburb,
                state: state,
                postcode: postcode,
                country: 'Australia'
              },
              parkingSpaces: doc.garages || 1,
              tier: 'Standard'
            }
          }
        }
      });

      if (bulkOps.length >= 500) {
        await collection.bulkWrite(bulkOps);
        processed += bulkOps.length;
        console.log(`Updated ${processed} / ${count} properties...`);
        bulkOps.length = 0;
      }
    }

    if (bulkOps.length > 0) {
      await collection.bulkWrite(bulkOps);
      processed += bulkOps.length;
      console.log(`Updated ${processed} / ${count} properties...`);
    }

    console.log('✅ Successfully published and populated all properties in MongoDB!');
    process.exit(0);
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

run();
