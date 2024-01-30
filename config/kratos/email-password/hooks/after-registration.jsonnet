function(ctx) {
	first_name: ctx.identity.traits.name.first,
	last_name: ctx.identity.traits.name.last,
	email: ctx.identity.traits.email,
}
