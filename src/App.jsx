import React, { useState } from 'react'
import nlp from 'compromise'
import MealDetails from './MealDetails'

const stopWords = [
	'a',
	'about',
	'above',
	'after',
	'again',
	'against',
	'all',
	'am',
	'an',
	'and',
	'any',
	'are',
	"aren't",
	'as',
	'at',
	'be',
	'because',
	'been',
	'before',
	'being',
	'below',
	'between',
	'both',
	'but',
	'by',
	"can't",
	'cannot',
	'could',
	"couldn't",
	'did',
	"didn't",
	'do',
	'does',
	"doesn't",
	'doing',
	"don't",
	'down',
	'during',
	'each',
	'few',
	'for',
	'from',
	'further',
	'had',
	"hadn't",
	'has',
	"hasn't",
	'have',
	"haven't",
	'having',
	'he',
	"he'd",
	"he'll",
	"he's",
	'her',
	'here',
	"here's",
	'hers',
	'herself',
	'him',
	'himself',
	'his',
	'how',
	"how's",
	'i',
	"i'd",
	"i'll",
	"i'm",
	"i've",
	'if',
	'in',
	'into',
	'is',
	"isn't",
	'it',
	"it's",
	'its',
	'itself',
	"let's",
	'me',
	'more',
	'most',
	"mustn't",
	'my',
	'myself',
	'no',
	'nor',
	'not',
	'of',
	'off',
	'on',
	'once',
	'only',
	'or',
	'other',
	'ought',
	'our',
	'ours',
	'ourselves',
	'out',
	'over',
	'own',
	'same',
	"shan't",
	'she',
	"she'd",
	"she'll",
	"she's",
	'should',
	"shouldn't",
	'so',
	'some',
	'such',
	'than',
	'that',
	"that's",
	'the',
	'their',
	'theirs',
	'them',
	'themselves',
	'then',
	'there',
	"there's",
	'these',
	'they',
	"they'd",
	"they'll",
	"they're",
	"they've",
	'this',
	'those',
	'through',
	'to',
	'too',
	'under',
	'until',
	'up',
	'very',
	'was',
	"wasn't",
	'we',
	"we'd",
	"we'll",
	"we're",
	"we've",
	'were',
	"weren't",
	'what',
	"what's",
	'when',
	"when's",
	'where',
	"where's",
	'which',
	'while',
	'who',
	"who's",
	'whom',
	'why',
	"why's",
	'with',
	"won't",
	'would',
	"wouldn't",
	'you',
	"you'd",
	"you'll",
	"you're",
	"you've",
	'your',
	'yours',
	'yourself',
	'yourselves',
]

const MealSearchAdvanced = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const [meals, setMeals] = useState([])
	const [loading, setLoading] = useState(false)
	const [searchCompleted, setSearchCompleted] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [resultsPerPage, setResultsPerPage] = useState(10)
	const [selectedMeal, setSelectedMeal] = useState(null)

	const preprocessText = (text) => {
		const tokens = text
			.toLowerCase()
			.split(/\s+/)
			.map((word) => word.replace(/[.,!?]/g, ''))

		const filteredTokens = tokens.filter((token) => !stopWords.includes(token))

		const lemmatizedTokens = filteredTokens.map((token) => {
			const doc = nlp(token)
			return doc.normalize().out('lemma')
		})

		return lemmatizedTokens
	}

	function generateSearchVariants(tokens) {
		const variants = []

		variants.push(tokens.join(' '))
		if (tokens.length > 1) {
			variants.push(tokens.slice().reverse().join(' '))
		}

		tokens.forEach((token) => {
			variants.push(token)
		})

		return [...new Set(variants)]
	}

	const searchMeals = async () => {
		setLoading(true)
		setMeals([])
		try {
			const tokens = preprocessText(searchQuery)
			const variants = generateSearchVariants(tokens)

			const allQueries = [searchQuery, ...variants, ...tokens]

			const uniqueQueries = Array.from(new Set(allQueries))

			const results = await Promise.all(
				uniqueQueries.map(async (query) => {
					const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
					const data = await response.json()
					return data.meals || []
				})
			)

			const combinedResults = Array.from(new Map(results.flat().map((meal) => [meal.idMeal, meal])).values())

			setMeals(combinedResults)
			setSearchCompleted(true)
			setCurrentPage(1)
		} catch (error) {
			console.error('Error fetching data:', error)
		} finally {
			setLoading(false)
		}
	}

	// Pagination-related calculations
	const indexOfLastMeal = currentPage * resultsPerPage
	const indexOfFirstMeal = indexOfLastMeal - resultsPerPage
	const currentMeals = meals.slice(indexOfFirstMeal, indexOfLastMeal)
	const totalPages = Math.ceil(meals.length / resultsPerPage)

	const handlePageClick = (page) => {
		setCurrentPage(page)
	}

	if (selectedMeal) {
		return <MealDetails meal={selectedMeal} onBack={() => setSelectedMeal(null)} />
	}

	return (
		<div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
			<h2>The Meal Search Bar</h2>
			<input
				type="text"
				placeholder="Search for a meal..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				style={{ padding: '10px', width: '300px', marginRight: '10px' }}
			/>
			<button onClick={searchMeals} style={{ padding: '10px' }} disabled={loading}>
				{loading ? 'Searching...' : 'Search'}
			</button>

			{/* Select for results per page (only when searchCompleted is true) */}
			{searchCompleted && (
				<div style={{ marginTop: '20px' }}>
					<label>
						Results per page:{' '}
						<select value={resultsPerPage} onChange={(e) => setResultsPerPage(Number(e.target.value))} style={{ padding: '5px' }}>
							<option value={5}>5</option>
							<option value={10}>10</option>
							<option value={25}>25</option>
						</select>
					</label>
				</div>
			)}

			{/* Results */}
			{meals.length > 0 ? (
				<div style={{ marginTop: '20px' }}>
					<h3>Results :</h3>
					<ul style={{ listStyle: 'none', padding: 0 }}>
						{currentMeals.map((meal) => (
							<li
								key={meal.idMeal}
								style={{
									cursor: 'pointer',
									padding: '10px',
									border: '1px solid #ccc',
									marginBottom: '10px',
									borderRadius: '5px',
									background: '#f9f9f9',
								}}
							>
								<h4 style={{ color: 'black' }}>{meal.strMeal}</h4>
								<img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '100px', borderRadius: '5px' }} />
								<p style={{ margin: '10px 0', fontSize: '0.9rem', color: '#555' }}>{meal.strInstructions?.slice(0, 100)}...</p>
								<button
									onClick={() => setSelectedMeal(meal)}
									style={{
										backgroundColor: '#007BFF',
										color: '#fff',
										border: 'none',
										padding: '10px',
										borderRadius: '5px',
										cursor: 'pointer',
									}}
								>
									Let's Cook It
								</button>
							</li>
						))}
					</ul>

					{/* Pagination Controls */}
					<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '10px', marginRight: '5px' }}>
							Previous
						</button>
						{[...Array(totalPages).keys()].map((page) => (
							<span
								key={page + 1}
								onClick={() => handlePageClick(page + 1)}
								style={{
									padding: '10px',
									margin: '0 5px',
									cursor: 'pointer',
									fontWeight: currentPage === page + 1 ? 'bold' : 'normal',
									border: currentPage === page + 1 ? '1px solid #007BFF' : '1px solid transparent',
									color: currentPage === page + 1 ? '#007BFF' : '#000',
								}}
							>
								{page + 1}
							</span>
						))}
						<button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '10px', marginLeft: '5px' }}>
							Next
						</button>
					</div>
				</div>
			) : (
				searchCompleted && <p>There are no results matching your query.</p>
			)}

			{loading && <p>Loading...</p>}
		</div>
	)
}

export default MealSearchAdvanced
