import React from 'react'

const MealDetails = ({ meal, onBack }) => {
	return (
		<div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
			<button onClick={onBack} style={{ marginBottom: '20px', padding: '10px', borderRadius: '5px', backgroundColor: '#007BFF', color: '#fff', border: 'none', cursor: 'pointer' }}>
				Back to Results
			</button>
			<h2>{meal.strMeal}</h2>
			<img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '300px', borderRadius: '10px', marginBottom: '20px' }} />
			<p>
				<strong>Category:</strong> {meal.strCategory || 'N/A'}
			</p>
			<p>
				<strong>Cuisine:</strong> {meal.strArea || 'N/A'}
			</p>
			<p>
				<strong>Instructions:</strong>
			</p>
			<p style={{ lineHeight: '1.6' }}>{meal.strInstructions}</p>
			<p>
				<strong>Ingredients:</strong>
			</p>
			<ul>
				{Array.from({ length: 20 }, (_, i) => {
					const ingredient = meal[`strIngredient${i + 1}`]
					const measure = meal[`strMeasure${i + 1}`]
					return ingredient ? (
						<li key={i}>
							{ingredient} - {measure}
						</li>
					) : null
				})}
			</ul>
		</div>
	)
}

export default MealDetails
