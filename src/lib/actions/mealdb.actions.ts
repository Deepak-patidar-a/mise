import { getCategoryEmoji } from "../utils"


const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

export const getRecipeofTheDay = async () => {

    try{
    const res = await fetch(`${BASE_URL}/random.php` , {
        next: { revalidate: 86400 } // Revalidate every 24 hour
    })
    if(!res.ok){
        throw new Error('Some HTTP error occurred while fetching recipe of the day')
    }
    const data = await res.json()
    return {
        success: true,
        recipe: data.meals[0]
    }
    } catch (error) {
    console.error('Error fetching recipe of the day:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching recipe of the day'
    throw new Error(errorMessage)
    }
}

export const getCategories = async () => {
    try {
        const res = await fetch(`${BASE_URL}/categories.php`, {
            next: { revalidate: 604800 } // Revalidate after 1 week
        })
        if (!res.ok) {
            throw new Error('Some HTTP error occurred while fetching categories')
        }
        const data = await res.json()
        return {
            success: true,
            categories: data.categories || []
        }
    } catch (error) {
        console.error('Error fetching categories:', error)
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching categories'
        throw new Error(errorMessage)
    }
}

export const getAreas = async () => {
    try {
        const res = await fetch(`${BASE_URL}/list.php?a=list`, {
            next: { revalidate: 604800 } // Revalidate after 1 week
        })
        if (!res.ok) {
            throw new Error('Some HTTP error occurred while fetching areas')
        }
        const data = await res.json()
        return {
            success: true,
            areas: data.meals || []
        }
    } catch (error) {
        console.error('Error fetching areas:', error)
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching areas'
        throw new Error(errorMessage)
    }
}

export  const getMealsByCategory = async (category : string) => {
    try {
        const res = await fetch(`${BASE_URL}/filter.php?c=${category}`,{
                next: { revalidate: 86400 } // Revalidate every 24 hour
        })
        if (!res.ok) {
            throw new Error('Some HTTP error occurred while fetching meals by category')
        }
        const data = await res.json()
        return {
            success: true,
            meals: data.meals || [],
            category: category
        }
    } catch (error) {
        console.error('Error fetching meals by category:', error)
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching meals by category'
        throw new Error(errorMessage)
    }
}

export const getMealsByArea = async (area : string) => {
    try {
        const res = await fetch(`${BASE_URL}/filter.php?a=${area}`,{
            next: { revalidate: 86400 } // Revalidate every 24 hour
        })
        if (!res.ok) {
            throw new Error('Some HTTP error occurred while fetching meals by area')
        }
        const data = await res.json()
        return {
            success: true,
            meals: data.meals || [],
            area: area
        }
    } catch (error) {
        console.error('Error fetching meals by area:', error)
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching meals by area'
        throw new Error(errorMessage)
    }
}

const getCategoryEmojiWithFallback = (category : string) => {
    const emoji = getCategoryEmoji(category)
    return emoji ? `${emoji} ${category}` : category
}

export const getCategoriesWithEmojis = async () => {
    const categoriesData = await getCategories()
    if (categoriesData.success) {
        return categoriesData.categories.map((cat: { name: string }) => ({
            ...cat,
            name: getCategoryEmojiWithFallback(cat.name)
        }))
    }
    return []
}