exports.api = [
	{
		resource: "accounts",
		methods: [
			{
				method: "POST",
				lambda: "TodoCreateAccount-POST"
			}
		]
	},
	{
		resource: "token",
		methods: [
			{
				method: "POST",
				lambda: "TodoLoginAccount-POST"
			}
		]
	}
]