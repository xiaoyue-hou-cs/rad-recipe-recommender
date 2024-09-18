function AccountBlock({dev} : any) {
    return (
        <div key={dev}>
            <h1>Name: {dev.name}</h1>
            <p>Email: {dev.email}</p>
            <p>Recipe List: {JSON.stringify(dev.recipe_list?.map((num : any) => num.mal_id))}</p>
        </div>
    )
}

export default AccountBlock